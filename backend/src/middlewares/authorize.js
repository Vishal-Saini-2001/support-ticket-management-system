const ApiError = require('../utils/ApiError');

/**
 * Restricts route access to users having one of the specified roles.
 * @param {...string} roles
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }

    return next();
  };
}

module.exports = authorize;

