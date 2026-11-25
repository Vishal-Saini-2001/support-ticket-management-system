const Joi = require('joi');

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } });

const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: emailSchema.required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};

