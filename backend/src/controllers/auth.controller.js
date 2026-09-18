const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const result = await authService.registerPatient({ name, email, phone, password });
  res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password, expectedRole: 'PATIENT' });
  res.status(200).json({ success: true, message: 'Login successful.', data: result });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password, expectedRole: 'ADMIN' });
  res.status(200).json({ success: true, message: 'Login successful.', data: result });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json({ success: true, message: 'User fetched.', data: user });
});

module.exports = { register, login, adminLogin, me };
