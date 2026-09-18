const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

async function listDoctors({ activeOnly = false } = {}) {
  return prisma.doctor.findMany({
    where: activeOnly ? { status: 'ACTIVE' } : undefined,
    orderBy: { name: 'asc' },
  });
}

async function getDoctorById(id) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }
  return doctor;
}

async function createDoctor({ name, email, phone, specialization, status }) {
  const existing = await prisma.doctor.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('A doctor with this email already exists.', 409);
  }
  return prisma.doctor.create({
    data: { name, email, phone, specialization, status: status || 'ACTIVE' },
  });
}

async function updateDoctor(id, { name, email, phone, specialization, status }) {
  await getDoctorById(id);

  if (email) {
    const existing = await prisma.doctor.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      throw new AppError('A doctor with this email already exists.', 409);
    }
  }

  return prisma.doctor.update({
    where: { id },
    data: { name, email, phone, specialization, status },
  });
}

// Soft delete: deactivate rather than remove, so existing appointment/
// availability history stays intact.
async function deactivateDoctor(id) {
  await getDoctorById(id);
  return prisma.doctor.update({ where: { id }, data: { status: 'INACTIVE' } });
}

async function activateDoctor(id) {
  await getDoctorById(id);
  return prisma.doctor.update({ where: { id }, data: { status: 'ACTIVE' } });
}

module.exports = { listDoctors, getDoctorById, createDoctor, updateDoctor, deactivateDoctor, activateDoctor };
