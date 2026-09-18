// Thrown from services/controllers for expected, user-facing failures.
// The central error handler turns these into consistent JSON responses.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isAppError = true;
  }
}

module.exports = AppError;
