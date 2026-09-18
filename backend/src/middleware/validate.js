const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after express-validator check chains; throws the first validation
// error as a 400 AppError so the central handler formats it consistently.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
  next();
}

module.exports = validate;
