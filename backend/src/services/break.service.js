const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parseDateOnly, formatDateOnly, isValidDateString } = require('../utils/date');
const { rangesOverlap, generateSlots, timeToMinutes } = require('../utils/time');
const { getDoctorById } = require('./doctor.service');

function serializeBreak(brk) {
  return { ...brk, date: formatDateOnly(brk.date) };
}

async function listBreaks({ doctorId, date } = {}) {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (date && isValidDateString(date)) where.date = parseDateOnly(date);

  const records = await prisma.doctorBreak.findMany({
    where,
    include: { doctor: { select: { id: true, name: true, specialization: true } } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
  return records.map(serializeBreak);
}

// Every free 30-minute slot for a doctor/date, given the current
// availability periods, a set of breaks, and appointments to treat as
// occupying their slot. Shared by slot generation and rescheduling so
// there is exactly one source of truth for "what's free".
function computeFreeSlots({ periods, breaks, occupiedStartTimes }) {
  const allSlots = periods.flatMap((p) => generateSlots(p.startTime, p.endTime));
  return allSlots.filter((slot) => {
    const inBreak = breaks.some((b) => rangesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime));
    const isOccupied = occupiedStartTimes.has(slot.startTime);
    return !inBreak && !isOccupied;
  });
}

// Picks the free slot nearest to the original time. Ties (equal distance)
// prefer the LATER slot, per the documented deterministic rule.
function findNearestSlot(freeSlots, originalStartTime) {
  const originalMinutes = timeToMinutes(originalStartTime);
  let best = null;
  let bestDistance = Infinity;

  for (const slot of freeSlots) {
    const slotMinutes = timeToMinutes(slot.startTime);
    const distance = Math.abs(slotMinutes - originalMinutes);
    if (
      distance < bestDistance ||
      (distance === bestDistance && best && slotMinutes > timeToMinutes(best.startTime))
    ) {
      best = slot;
      bestDistance = distance;
    }
  }
  return best;
}

// Validates a break's shape/date/time and that it sits fully inside a
// single availability period (the simpler, safer rule documented in the
// README rather than splitting a break across a gap between periods).
async function validateBreakWindow(tx, { doctorId, date, startTime, endTime, excludeBreakId }) {
  if (!isValidDateString(date)) {
    throw new AppError('A valid date is required.', 400);
  }
  if (endTime <= startTime) {
    throw new AppError('End time must be after start time.', 400);
  }

  const periods = await tx.doctorAvailability.findMany({ where: { doctorId, date: parseDateOnly(date) } });
  const containingPeriod = periods.find((p) => p.startTime <= startTime && endTime <= p.endTime);
  if (!containingPeriod) {
    throw new AppError("Break must fall entirely within one of the doctor's availability periods for that date.", 400);
  }

  const otherBreaks = await tx.doctorBreak.findMany({
    where: { doctorId, date: parseDateOnly(date), ...(excludeBreakId ? { id: { not: excludeBreakId } } : {}) },
  });
  const conflict = otherBreaks.find((b) => rangesOverlap(startTime, endTime, b.startTime, b.endTime));
  if (conflict) {
    throw new AppError(`This break overlaps an existing break (${conflict.startTime}-${conflict.endTime}).`, 409);
  }

  return periods;
}

// Finds BOOKED appointments overlapping [startTime, endTime) and moves each
// to the nearest still-free slot, processed in start-time order so two
// affected appointments never collide on the same new slot. Throws (and so
// rolls back the whole transaction) if any affected appointment has no
// valid replacement slot.
async function rescheduleAffectedAppointments(tx, { doctorId, date, startTime, endTime }) {
  const periods = await tx.doctorAvailability.findMany({ where: { doctorId, date: parseDateOnly(date) } });
  const breaks = (await tx.doctorBreak.findMany({ where: { doctorId, date: parseDateOnly(date) } })).map((b) => ({
    startTime: b.startTime,
    endTime: b.endTime,
  }));

  const allAppointments = await tx.appointment.findMany({
    where: { doctorId, appointmentDate: parseDateOnly(date), status: 'BOOKED' },
    orderBy: { startTime: 'asc' },
  });

  const affected = allAppointments.filter((a) => rangesOverlap(a.startTime, a.endTime, startTime, endTime));
  if (affected.length === 0) return [];

  // Slots held by appointments NOT affected by this break stay occupied.
  const unaffectedStartTimes = new Set(
    allAppointments.filter((a) => !affected.includes(a)).map((a) => a.startTime)
  );
  const claimed = new Set(unaffectedStartTimes);

  const moves = [];
  for (const appointment of affected) {
    const freeSlots = computeFreeSlots({ periods, breaks, occupiedStartTimes: claimed });
    const nearest = findNearestSlot(freeSlots, appointment.startTime);

    if (!nearest) {
      throw new AppError(
        'Break cannot be added because one or more existing appointments cannot be rescheduled.',
        409
      );
    }

    claimed.add(nearest.startTime);
    await tx.appointment.update({
      where: { id: appointment.id },
      data: { startTime: nearest.startTime, endTime: nearest.endTime },
    });

    moves.push({ appointmentId: appointment.id, from: appointment.startTime, to: nearest.startTime });
  }

  return moves;
}

async function createBreak({ doctorId, date, startTime, endTime, reason }) {
  const doctor = await getDoctorById(doctorId);
  if (doctor.status !== 'ACTIVE') {
    throw new AppError('Cannot add a break for an inactive doctor.', 400);
  }

  return prisma.$transaction(async (tx) => {
    await validateBreakWindow(tx, { doctorId, date, startTime, endTime });

    const created = await tx.doctorBreak.create({
      data: { doctorId, date: parseDateOnly(date), startTime, endTime, reason: reason || null },
    });

    const rescheduled = await rescheduleAffectedAppointments(tx, { doctorId, date, startTime, endTime });

    return { break: serializeBreak(created), rescheduled };
  });
}

async function updateBreak(id, { startTime, endTime, reason }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.doctorBreak.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Break not found.', 404);
    }

    const doctorId = existing.doctorId;
    const date = formatDateOnly(existing.date);

    await validateBreakWindow(tx, { doctorId, date, startTime, endTime, excludeBreakId: id });

    const updated = await tx.doctorBreak.update({
      where: { id },
      data: { startTime, endTime, reason: reason ?? existing.reason },
    });

    const rescheduled = await rescheduleAffectedAppointments(tx, { doctorId, date, startTime, endTime });

    return { break: serializeBreak(updated), rescheduled };
  });
}

async function deleteBreak(id) {
  const existing = await prisma.doctorBreak.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Break not found.', 404);
  }
  await prisma.doctorBreak.delete({ where: { id } });
}

module.exports = {
  listBreaks,
  createBreak,
  updateBreak,
  deleteBreak,
  computeFreeSlots,
  findNearestSlot,
};
