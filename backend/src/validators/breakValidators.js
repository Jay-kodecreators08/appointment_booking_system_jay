const { body } = require('express-validator');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const breakValidator = [
  body('doctorId').trim().notEmpty().withMessage('Doctor is required.'),
  body('date').isISO8601().withMessage('A valid date is required.'),
  body('startTime').matches(timePattern).withMessage('Start time must be in HH:mm format.'),
  body('endTime').matches(timePattern).withMessage('End time must be in HH:mm format.'),
  body('endTime').custom((value, { req }) => {
    if (value <= req.body.startTime) {
      throw new Error('End time must be after start time.');
    }
    return true;
  }),
  body('reason').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Reason is too long.'),
];

module.exports = { breakValidator };
