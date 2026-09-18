const prisma = require('../config/prisma');
const { todayDateString, parseDateOnly } = require('../utils/date');

async function getAdminDashboard() {
  const today = parseDateOnly(todayDateString());

  const [totalDoctors, totalPatients, totalAppointments, todaysAppointments, cancelledAppointments] =
    await Promise.all([
      prisma.doctor.count(),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { appointmentDate: today, status: 'BOOKED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
    ]);

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    todaysAppointments,
    cancelledAppointments,
  };
}

module.exports = { getAdminDashboard };
