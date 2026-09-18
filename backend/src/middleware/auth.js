const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Authentication token is required.', 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    throw new AppError('Invalid or expired authentication token.', 401);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError('Admin access required.', 403);
  }
  next();
}

function requirePatient(req, res, next) {
  if (req.user?.role !== 'PATIENT') {
    throw new AppError('Patient access required.', 403);
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requirePatient };
