const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

async function registerPatient({ name, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, role: 'PATIENT' },
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: toPublicUser(user), token };
}

async function login({ email, password, expectedRole }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== expectedRole) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: toPublicUser(user), token };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return toPublicUser(user);
}

module.exports = { registerPatient, login, getCurrentUser, toPublicUser };
