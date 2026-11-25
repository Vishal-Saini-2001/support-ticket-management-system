const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const { assertTicketAccess } = require('./ticketService');
const eventBus = require('../events/eventBus');
const EVENTS = require('../events/events');

async function getCommentsByTicket(ticketId, user) {
  const ticket = await Ticket.findById(ticketId);
  assertTicketAccess(ticket, user);

  return Comment.find({ ticket: ticket._id })
    .populate('author', 'name email role')
    .sort({ createdAt: 1 });
}

async function addComment(ticketId, message, user) {
  const ticket = await Ticket.findById(ticketId);
  assertTicketAccess(ticket, user);

  const comment = await Comment.create({
    ticket: ticket._id,
    author: user._id,
    message,
  });

  await comment.populate('author', 'name email role');

  eventBus.emit(EVENTS.COMMENT_ADDED, {
    ticket,
    comment,
    actor: user,
  });

  return comment;
}

module.exports = {
  getCommentsByTicket,
  addComment,
};

