const asyncHandler = require('../utils/asyncHandler');
const breakService = require('../services/break.service');

const listBreaks = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  const data = await breakService.listBreaks({ doctorId, date });
  res.status(200).json({ success: true, message: 'Breaks fetched.', data });
});

const createBreak = asyncHandler(async (req, res) => {
  const { break: created, rescheduled } = await breakService.createBreak(req.body);
  const message =
    rescheduled.length > 0
      ? `Break added. ${rescheduled.length} appointment(s) were automatically rescheduled.`
      : 'Break added successfully.';
  res.status(201).json({ success: true, message, data: { break: created, rescheduled } });
});

const updateBreak = asyncHandler(async (req, res) => {
  const { break: updated, rescheduled } = await breakService.updateBreak(req.params.id, req.body);
  const message =
    rescheduled.length > 0
      ? `Break updated. ${rescheduled.length} appointment(s) were automatically rescheduled.`
      : 'Break updated successfully.';
  res.status(200).json({ success: true, message, data: { break: updated, rescheduled } });
});

const deleteBreak = asyncHandler(async (req, res) => {
  await breakService.deleteBreak(req.params.id);
  res.status(200).json({ success: true, message: 'Break removed successfully.' });
});

module.exports = { listBreaks, createBreak, updateBreak, deleteBreak };
