const dotenv = require('dotenv');

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/support_tickets',
  jwtSecret:
    process.env.JWT_SECRET ||
    (nodeEnv === 'test' ? 'test-jwt-secret-key-for-jest-suite' : ''),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  adminSeed: {
    name: process.env.ADMIN_NAME || 'System Admin',
    email: process.env.ADMIN_EMAIL || 'admin@support.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
};

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

module.exports = env;

