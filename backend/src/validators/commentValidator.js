const Joi = require('joi');
const { objectIdSchema } = require('./ticketValidator');

const createCommentSchema = {
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
  body: Joi.object({
    message: Joi.string().trim().min(1).max(3000).required(),
  }),
};

module.exports = {
  createCommentSchema,
};

