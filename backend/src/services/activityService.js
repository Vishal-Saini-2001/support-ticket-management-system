const Ticket = require('../models/Ticket');
const ActivityLog = require('../models/ActivityLog');
const { assertTicketAccess } = require('./ticketService');

async function getTicketActivity(ticketId, user) {
  const ticket = await Ticket.findById(ticketId);
  assertTicketAccess(ticket, user);

  return ActivityLog.find({ ticket: ticket._id })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 });
}

module.exports = {
  getTicketActivity,
};

