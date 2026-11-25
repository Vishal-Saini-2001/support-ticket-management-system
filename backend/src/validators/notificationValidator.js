const Joi = require('joi');

const notificationIdParamSchema = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid notification ID format',
      }),
  }),
};

module.exports = {
  notificationIdParamSchema,
};

