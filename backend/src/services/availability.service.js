const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parseDateOnly, formatDateOnly, isValidDateString } = require('../utils/date');
const { rangesOverlap } = require('../utils/time');
const { getDoctorById } = require('./doctor.service');

function serialize(availability) {
  return { ...availability, date: formatDateOnly(availability.date) };
}

async function listAvailability({ doctorId, date } = {}) {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (date && isValidDateString(date)) where.date = parseDateOnly(date);

  const records = await prisma.doctorAvailability.findMany({
    where,
    include: { doctor: { select: { id: true, name: true, specialization: true } } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
  return records.map(serialize);
}

// All availability periods for one doctor/date, sorted by start time.
// A doctor can have several non-overlapping periods on the same date.
async function getPeriodsForDate(doctorId, dateString) {
  if (!isValidDateString(dateString)) {
    throw new AppError('A valid date is required.', 400);
  }
  const records = await prisma.doctorAvailability.findMany({
    where: { doctorId, date: parseDateOnly(dateString) },
    orderBy: { startTime: 'asc' },
  });
  return records.map(serialize);
}

async function assertNoOverlap({ doctorId, date, startTime, endTime, excludeId } = {}) {
  const existing = await prisma.doctorAvailability.findMany({
    where: { doctorId, date: parseDateOnly(date), ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  const conflict = existing.find((period) => rangesOverlap(startTime, endTime, period.startTime, period.endTime));
  if (conflict) {
    throw new AppError(
      `This period overlaps an existing availability period (${conflict.startTime}-${conflict.endTime}).`,
      409
    );
  }
}

// Adds a new availability period. Same doctor/date can now have multiple
// periods, as long as they don't overlap.
async function createAvailability({ doctorId, date, startTime, endTime }) {
  if (!isValidDateString(date)) {
    throw new AppError('A valid date is required.', 400);
  }

  const doctor = await getDoctorById(doctorId);
  if (doctor.status !== 'ACTIVE') {
    throw new AppError('Cannot set availability for an inactive doctor.', 400);
  }

  if (endTime <= startTime) {
    throw new AppError('End time must be after start time.', 400);
  }

  await assertNoOverlap({ doctorId, date, startTime, endTime });

  const record = await prisma.doctorAvailability.create({
    data: { doctorId, date: parseDateOnly(date), startTime, endTime },
  });

  return serialize(record);
}

async function updateAvailabilityById(id, { startTime, endTime }) {
  const record = await prisma.doctorAvailability.findUnique({ where: { id } });
  if (!record) {
    throw new AppError('Availability not found.', 404);
  }
  if (endTime <= startTime) {
    throw new AppError('End time must be after start time.', 400);
  }

  await assertNoOverlap({
    doctorId: record.doctorId,
    date: formatDateOnly(record.date),
    startTime,
    endTime,
    excludeId: id,
  });

  const updated = await prisma.doctorAvailability.update({
    where: { id },
    data: { startTime, endTime },
  });
  return serialize(updated);
}

async function deleteAvailability(id) {
  const record = await prisma.doctorAvailability.findUnique({ where: { id } });
  if (!record) {
    throw new AppError('Availability not found.', 404);
  }
  await prisma.doctorAvailability.delete({ where: { id } });
}

module.exports = {
  listAvailability,
  getPeriodsForDate,
  createAvailability,
  updateAvailabilityById,
  deleteAvailability,
};
