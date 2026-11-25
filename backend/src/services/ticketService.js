const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const eventBus = require('../events/eventBus');
const EVENTS = require('../events/events');

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'priority', 'status', 'title'];

function assertTicketAccess(ticket, user) {
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  const ownerId = ticket.createdBy?._id || ticket.createdBy;
  if (user.role !== 'admin' && String(ownerId) !== String(user._id)) {
    throw new ApiError(403, 'You do not have permission to access this ticket');
  }
}

function parseSort(sortParam) {
  if (!sortParam) {
    return { createdAt: -1 };
  }

  const sortObj = {};
  const fields = sortParam.split(',').map((item) => item.trim()).filter(Boolean);

  for (const field of fields) {
    const isDesc = field.startsWith('-');
    const cleanField = isDesc ? field.slice(1) : field;
    if (ALLOWED_SORT_FIELDS.includes(cleanField)) {
      sortObj[cleanField] = isDesc ? -1 : 1;
    }
  }

  return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listTickets(query, user) {
  const filter = {};

  if (user.role !== 'admin') {
    filter.createdBy = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = parseSort(query.sort);

  const [data, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

async function createTicket(payload, user) {
  const ticket = await Ticket.create({
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority || 'medium',
    status: 'open',
    createdBy: user._id,
  });

  await ticket.populate('createdBy', 'name email role');

  eventBus.emit(EVENTS.TICKET_CREATED, {
    ticket,
    actor: user,
  });

  return ticket;
}

async function getTicketById(ticketId, user) {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email role');
  assertTicketAccess(ticket, user);
  return ticket;
}

async function updateTicket(ticketId, updates, user) {
  const ticket = await Ticket.findById(ticketId);
  assertTicketAccess(ticket, user);

  if (user.role !== 'admin' && ticket.status !== 'open') {
    throw new ApiError(403, 'Tickets can only be edited while status is open');
  }

  const oldValues = {};
  const newValues = {};
  const editableFields = ['title', 'description', 'category'];

  for (const field of editableFields) {
    if (updates[field] !== undefined && updates[field] !== ticket[field]) {
      oldValues[field] = ticket[field];
      newValues[field] = updates[field];
      ticket[field] = updates[field];
    }
  }

  await ticket.save();
  await ticket.populate('createdBy', 'name email role');

  if (Object.keys(newValues).length > 0) {
    eventBus.emit(EVENTS.TICKET_UPDATED, {
      ticket,
      actor: user,
      oldValues,
      newValues,
    });
  }

  return ticket;
}

async function deleteTicket(ticketId, user) {
  const ticket = await Ticket.findById(ticketId);
  assertTicketAccess(ticket, user);

  if (user.role !== 'admin' && ticket.status !== 'open') {
    throw new ApiError(403, 'Tickets can only be deleted while status is open');
  }

  await Comment.deleteMany({ ticket: ticket._id });
  await ticket.deleteOne();
}

async function updateTicketStatus(ticketId, newStatus, actor) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  const oldStatus = ticket.status;
  if (oldStatus === newStatus) {
    await ticket.populate('createdBy', 'name email role');
    return ticket;
  }

  ticket.status = newStatus;
  if (newStatus === 'resolved') {
    ticket.resolvedAt = new Date();
  } else if (oldStatus === 'resolved') {
    ticket.resolvedAt = null;
  }

  await ticket.save();
  await ticket.populate('createdBy', 'name email role');

  eventBus.emit(EVENTS.TICKET_STATUS_CHANGED, {
    ticket,
    actor,
    oldStatus,
    newStatus,
  });

  if (newStatus === 'resolved') {
    eventBus.emit(EVENTS.TICKET_RESOLVED, {
      ticket,
      actor,
    });
  }

  return ticket;
}

async function updateTicketPriority(ticketId, newPriority, actor) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  const oldPriority = ticket.priority;
  if (oldPriority === newPriority) {
    await ticket.populate('createdBy', 'name email role');
    return ticket;
  }

  ticket.priority = newPriority;
  await ticket.save();
  await ticket.populate('createdBy', 'name email role');

  eventBus.emit(EVENTS.TICKET_UPDATED, {
    ticket,
    actor,
    oldValues: { priority: oldPriority },
    newValues: { priority: newPriority },
  });

  return ticket;
}

module.exports = {
  assertTicketAccess,
  listTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  updateTicketPriority,
};

