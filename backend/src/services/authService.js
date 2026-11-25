const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}

async function register({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  // Always force role to 'user' regardless of incoming payload
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  const token = signToken(user);
  return { user: user.toJSON(), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);
  return { user: user.toJSON(), token };
}

async function logout(token, exp) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = exp
    ? new Date(exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RevokedToken.findOneAndUpdate(
    { tokenHash },
    { tokenHash, expiresAt },
    { upsert: true, new: true }
  );
}

module.exports = {
  register,
  login,
  logout,
  signToken,
};

