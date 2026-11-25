const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;

