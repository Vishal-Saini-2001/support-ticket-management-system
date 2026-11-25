const Joi = require('joi');
const { TICKET_PRIORITIES, TICKET_STATUSES } = require('../models/Ticket');

const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid ticket ID format',
  });

const ticketIdParamSchema = {
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
};

const createTicketSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).required(),
    description: Joi.string().trim().min(5).max(5000).required(),
    category: Joi.string().trim().min(2).max(100).required(),
    priority: Joi.string()
      .valid(...TICKET_PRIORITIES)
      .default('medium'),
  }),
};

const updateTicketSchema = {
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200),
    description: Joi.string().trim().min(5).max(5000),
    category: Joi.string().trim().min(2).max(100),
  }).min(1),
};

const listTicketsSchema = {
  query: Joi.object({
    status: Joi.string()
      .valid(...TICKET_STATUSES, '')
      .optional(),
    priority: Joi.string()
      .valid(...TICKET_PRIORITIES, '')
      .optional(),
    category: Joi.string().trim().allow('').optional(),
    search: Joi.string().trim().allow('').optional(),
    sort: Joi.string().trim().allow('').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

const updateStatusSchema = {
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid(...TICKET_STATUSES)
      .required(),
  }),
};

const updatePrioritySchema = {
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
  body: Joi.object({
    priority: Joi.string()
      .valid(...TICKET_PRIORITIES)
      .required(),
  }),
};

module.exports = {
  objectIdSchema,
  ticketIdParamSchema,
  createTicketSchema,
  updateTicketSchema,
  listTicketsSchema,
  updateStatusSchema,
  updatePrioritySchema,
};

