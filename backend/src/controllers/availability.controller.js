const asyncHandler = require('../utils/asyncHandler');
const availabilityService = require('../services/availability.service');

const listAvailability = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  const data = await availabilityService.listAvailability({ doctorId, date });
  res.status(200).json({ success: true, message: 'Availability fetched.', data });
});

const setAvailability = asyncHandler(async (req, res) => {
  const data = await availabilityService.createAvailability(req.body);
  res.status(201).json({ success: true, message: 'Availability period added successfully.', data });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const data = await availabilityService.updateAvailabilityById(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Availability updated successfully.', data });
});

const deleteAvailability = asyncHandler(async (req, res) => {
  await availabilityService.deleteAvailability(req.params.id);
  res.status(200).json({ success: true, message: 'Availability removed successfully.' });
});

module.exports = { listAvailability, setAvailability, updateAvailability, deleteAvailability };
