const { body } = require('express-validator');

const doctorValidator = [
  body('name').trim().notEmpty().withMessage('Doctor name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required.'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE.'),
];

module.exports = { doctorValidator };
