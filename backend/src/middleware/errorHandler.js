const { Prisma } = require('@prisma/client');

// Converts Prisma errors into safe, user-facing messages. Never leak raw
// Prisma/SQL error details to the client.
function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      if (typeof target === 'string' && target.includes('active_slot')) {
        return { statusCode: 409, message: 'This appointment slot is no longer available.' };
      }
      return { statusCode: 409, message: 'A record with these details already exists.' };
    }
    if (err.code === 'P2025') {
      return { statusCode: 404, message: 'Requested record was not found.' };
    }
  }
  return null;
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isAppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  const prismaError = mapPrismaError(err);
  if (prismaError) {
    return res.status(prismaError.statusCode).json({ success: false, message: prismaError.message });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
}

module.exports = { errorHandler, notFoundHandler };
