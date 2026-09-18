const { body } = require('express-validator');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createAppointmentValidator = [
  body('doctorId').trim().notEmpty().withMessage('Doctor is required.'),
  body('appointmentDate').isISO8601().withMessage('A valid appointment date is required.'),
  body('startTime').matches(timePattern).withMessage('Start time must be in HH:mm format.'),
];

module.exports = { createAppointmentValidator };
