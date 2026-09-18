const asyncHandler = require('../utils/asyncHandler');
const appointmentService = require('../services/appointment.service');
const availabilityService = require('../services/availability.service');

const getDoctorAvailability = asyncHandler(async (req, res) => {
  const data = await availabilityService.getPeriodsForDate(req.params.id, req.query.date);
  res.status(200).json({ success: true, message: 'Availability fetched.', data });
});

const getDoctorSlots = asyncHandler(async (req, res) => {
  const data = await appointmentService.generateAvailableSlots(req.params.id, req.query.date);
  res.status(200).json({ success: true, message: 'Slots fetched.', data });
});

const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, startTime } = req.body;
  const data = await appointmentService.createAppointment({
    patientId: req.user.id,
    doctorId,
    appointmentDate,
    startTime,
  });
  res.status(201).json({ success: true, message: 'Appointment booked successfully.', data });
});

const myAppointments = asyncHandler(async (req, res) => {
  const data = await appointmentService.listMyAppointments(req.user.id);
  res.status(200).json({ success: true, message: 'Appointments fetched.', data });
});

const getAppointment = asyncHandler(async (req, res) => {
  const data = await appointmentService.getAppointmentById(req.params.id, { patientId: req.user.id });
  res.status(200).json({ success: true, message: 'Appointment fetched.', data });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const data = await appointmentService.cancelAppointment(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Appointment cancelled successfully.', data });
});

const adminListAppointments = asyncHandler(async (req, res) => {
  const { doctorId, date, status } = req.query;
  const data = await appointmentService.listAllAppointments({ doctorId, date, status });
  res.status(200).json({ success: true, message: 'Appointments fetched.', data });
});

module.exports = {
  getDoctorAvailability,
  getDoctorSlots,
  createAppointment,
  myAppointments,
  getAppointment,
  cancelAppointment,
  adminListAppointments,
};
