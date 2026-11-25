const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const auth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token missing or invalid');
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'Authentication token missing or invalid');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const isRevoked = await RevokedToken.exists({ tokenHash });
  if (isRevoked) {
    throw new ApiError(401, 'Token has been revoked. Please log in again.');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, 'User associated with token no longer exists');
  }

  req.user = user;
  req.token = token;
  req.tokenExp = decoded.exp;
  next();
});

module.exports = auth;

