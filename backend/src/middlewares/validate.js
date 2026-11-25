const ApiError = require('../utils/ApiError');

/**
 * Validates req.params, req.query, and req.body against Joi schemas.
 * @param {{ params?: object, query?: object, body?: object }} schemas
 */
function validate(schemas) {
  return (req, _res, next) => {
    const errors = [];
    const targets = ['params', 'query', 'body'];

    for (const target of targets) {
      if (!schemas[target]) {
        continue;
      }

      const { error, value } = schemas[target].validate(req[target], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        for (const detail of error.details) {
          errors.push({
            field: detail.path.join('.') || target,
            message: detail.message.replace(/"/g, ''),
          });
        }
      } else {
        req[target] = value;
      }
    }

    if (errors.length > 0) {
      return next(new ApiError(400, 'Validation failed', errors));
    }

    return next();
  };
}

module.exports = validate;

