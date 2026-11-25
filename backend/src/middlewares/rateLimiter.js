const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authRateLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.isTest ? 1000 : env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = {
  authRateLimiter,
};

