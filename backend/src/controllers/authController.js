const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.token, req.tokenExp);
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};

