const asyncHandler = require('../utils/asyncHandler');
const doctorService = require('../services/doctor.service');

const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.listDoctors();
  res.status(200).json({ success: true, message: 'Doctors fetched.', data: doctors });
});

const listActiveDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.listDoctors({ activeOnly: true });
  res.status(200).json({ success: true, message: 'Doctors fetched.', data: doctors });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, message: 'Doctor fetched.', data: doctor });
});

const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  res.status(201).json({ success: true, message: 'Doctor added successfully.', data: doctor });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Doctor updated successfully.', data: doctor });
});

const deactivateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.deactivateDoctor(req.params.id);
  res.status(200).json({ success: true, message: 'Doctor deactivated.', data: doctor });
});

const activateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.activateDoctor(req.params.id);
  res.status(200).json({ success: true, message: 'Doctor activated.', data: doctor });
});

module.exports = {
  listDoctors,
  listActiveDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deactivateDoctor,
  activateDoctor,
};
