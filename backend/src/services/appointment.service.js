const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateSlots, isValidTimeFormat, isAlignedToSlot, rangesOverlap, SLOT_DURATION_MINUTES } = require('../utils/time');
const { parseDateOnly, formatDateOnly, isValidDateString, isPastDate, todayDateString } = require('../utils/date');
const { getDoctorById } = require('./doctor.service');

function serializeAppointment(appt) {
  return {
    id: appt.id,
    doctorId: appt.doctorId,
    patientId: appt.patientId,
    appointmentDate: formatDateOnly(appt.appointmentDate),
    startTime: appt.startTime,
    endTime: appt.endTime,
    status: appt.status,
    createdAt: appt.createdAt,
    updatedAt: appt.updatedAt,
    doctor: appt.doctor
      ? { id: appt.doctor.id, name: appt.doctor.name, specialization: appt.doctor.specialization }
      : undefined,
    patient: appt.patient ? { id: appt.patient.id, name: appt.patient.name, email: appt.patient.email } : undefined,
  };
}

// Computes bookable slots for a doctor/date across ALL of that date's
// availability periods (a doctor can have several, e.g. 09:00-13:00 and
// 14:00-17:00 — the gap between them never produces a slot). Each period's
// 30-minute grid is generated independently, then slots are marked BOOKED,
// BREAK or PAST as they're covered by an appointment, a break, or the clock.
async function generateAvailableSlots(doctorId, dateString) {
  if (!isValidDateString(dateString)) {
    throw new AppError('A valid date is required.', 400);
  }

  const doctor = await getDoctorById(doctorId);
  if (doctor.status !== 'ACTIVE') {
    throw new AppError('This doctor is not currently accepting appointments.', 400);
  }

  const date = parseDateOnly(dateString);

  const periods = await prisma.doctorAvailability.findMany({
    where: { doctorId, date },
    orderBy: { startTime: 'asc' },
  });

  if (periods.length === 0) {
    return { availabilityPeriods: [], breaks: [], slots: [] };
  }

  const breaks = await prisma.doctorBreak.findMany({
    where: { doctorId, date },
    orderBy: { startTime: 'asc' },
  });

  const bookedAppointments = await prisma.appointment.findMany({
    where: { doctorId, appointmentDate: date, status: 'BOOKED' },
    select: { startTime: true },
  });
  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const isToday = dateString === todayDateString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const allSlots = periods.flatMap((p) => generateSlots(p.startTime, p.endTime));
  const slots = allSlots.map((slot) => {
    const [h, m] = slot.startTime.split(':').map(Number);
    const isPast = isToday && h * 60 + m <= nowMinutes;
    const isBooked = bookedTimes.has(slot.startTime);
    const isBreak = breaks.some((b) => rangesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime));
    const status = isBooked ? 'BOOKED' : isBreak ? 'BREAK' : isPast ? 'PAST' : 'AVAILABLE';

    return {
      ...slot,
      status,
      isBooked,
      isBreak,
      isPast,
      isAvailable: status === 'AVAILABLE',
    };
  });

  return {
    availabilityPeriods: periods.map((p) => ({ startTime: p.startTime, endTime: p.endTime })),
    breaks: breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime, reason: b.reason })),
    slots,
  };
}

// Re-validates everything server-side; never trusts that the frontend only
// offered valid slots.
async function createAppointment({ patientId, doctorId, appointmentDate, startTime }) {
  if (!isValidDateString(appointmentDate)) {
    throw new AppError('A valid appointment date is required.', 400);
  }
  if (!isValidTimeFormat(startTime)) {
    throw new AppError('A valid start time is required.', 400);
  }
  if (isPastDate(appointmentDate)) {
    throw new AppError('Cannot book an appointment in the past.', 400);
  }

  const doctor = await getDoctorById(doctorId);
  if (doctor.status !== 'ACTIVE') {
    throw new AppError('This doctor is not currently accepting appointments.', 400);
  }

  const date = parseDateOnly(appointmentDate);

  const periods = await prisma.doctorAvailability.findMany({ where: { doctorId, date } });
  if (periods.length === 0) {
    throw new AppError('Doctor is not available on the selected date.', 400);
  }

  // The slot must fall inside exactly one period, aligned to THAT period's
  // own 30-minute grid (periods don't share a grid across the gap between them).
  const containingPeriod = periods.find((p) => isAlignedToSlot(startTime, p.startTime, SLOT_DURATION_MINUTES));
  const slots = containingPeriod ? generateSlots(containingPeriod.startTime, containingPeriod.endTime) : [];
  const matchedSlot = slots.find((s) => s.startTime === startTime);
  if (!matchedSlot) {
    throw new AppError('Selected time is outside doctor availability.', 400);
  }

  const breaks = await prisma.doctorBreak.findMany({ where: { doctorId, date } });
  const onBreak = breaks.some((b) => rangesOverlap(matchedSlot.startTime, matchedSlot.endTime, b.startTime, b.endTime));
  if (onBreak) {
    throw new AppError('This appointment slot is unavailable because the doctor has a break.', 409);
  }

  if (appointmentDate === todayDateString()) {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const [h, m] = startTime.split(':').map(Number);
    if (h * 60 + m <= nowMinutes) {
      throw new AppError('Cannot book a time slot that has already passed.', 400);
    }
  }

  try {
    // Transaction + the partial unique DB index together stop two patients
    // from ever booking the same doctor/date/time, even under a race.
    const appointment = await prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findFirst({
        where: { doctorId, appointmentDate: date, startTime, status: 'BOOKED' },
      });
      if (existing) {
        throw new AppError('This appointment slot is no longer available.', 409);
      }

      return tx.appointment.create({
        data: {
          doctorId,
          patientId,
          appointmentDate: date,
          startTime: matchedSlot.startTime,
          endTime: matchedSlot.endTime,
          status: 'BOOKED',
        },
        include: { doctor: true, patient: true },
      });
    });

    return serializeAppointment(appointment);
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('This appointment slot is no longer available.', 409);
    }
    throw err;
  }
}

async function listMyAppointments(patientId) {
  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    include: { doctor: true },
    orderBy: [{ appointmentDate: 'desc' }, { startTime: 'desc' }],
  });
  return appointments.map(serializeAppointment);
}

async function getAppointmentById(id, { patientId } = {}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, patient: true },
  });
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }
  if (patientId && appointment.patientId !== patientId) {
    throw new AppError('You do not have access to this appointment.', 403);
  }
  return serializeAppointment(appointment);
}

async function cancelAppointment(id, patientId) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }
  if (appointment.patientId !== patientId) {
    throw new AppError('You do not have access to this appointment.', 403);
  }
  if (appointment.status === 'CANCELLED') {
    throw new AppError('Appointment is already cancelled.', 400);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { doctor: true, patient: true },
  });
  return serializeAppointment(updated);
}

async function listAllAppointments({ doctorId, date, status } = {}) {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;
  if (date && isValidDateString(date)) where.appointmentDate = parseDateOnly(date);

  const appointments = await prisma.appointment.findMany({
    where,
    include: { doctor: true, patient: true },
    orderBy: [{ appointmentDate: 'desc' }, { startTime: 'desc' }],
  });
  return appointments.map(serializeAppointment);
}

module.exports = {
  generateAvailableSlots,
  createAppointment,
  listMyAppointments,
  getAppointmentById,
  cancelAppointment,
  listAllAppointments,
};
