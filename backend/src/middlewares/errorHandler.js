const env = require('../config/env');

function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = undefined;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldLabel = duplicateFields.length > 0 ? duplicateFields.join(', ') : 'resource';
    message = `Duplicate value for ${fieldLabel}`;
    errors = undefined;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication token';
    errors = undefined;
  }

  if (statusCode >= 500 && !env.isTest) {
    console.error('[Unhandled Error]:', err);
  }

  if (env.isProduction && statusCode >= 500 && !err.isOperational) {
    message = 'Internal server error';
  }

  const payload = { message };
  if (errors !== undefined) {
    payload.errors = errors;
  }
  if (!env.isProduction && !env.isTest && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;

