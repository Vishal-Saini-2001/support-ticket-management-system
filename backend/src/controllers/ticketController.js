const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');

const listTickets = asyncHandler(async (req, res) => {
  const result = await ticketService.listTickets(req.query, req.user);
  res.status(200).json(result);
});

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.body, req.user);
  res.status(201).json({ data: ticket });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id, req.user);
  res.status(200).json({ data: ticket });
});

const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
  res.status(200).json({ data: ticket });
});

const deleteTicket = asyncHandler(async (req, res) => {
  await ticketService.deleteTicket(req.params.id, req.user);
  res.status(200).json({ message: 'Ticket deleted successfully' });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicketStatus(
    req.params.id,
    req.body.status,
    req.user
  );
  res.status(200).json({ data: ticket });
});

const updateTicketPriority = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicketPriority(
    req.params.id,
    req.body.priority,
    req.user
  );
  res.status(200).json({ data: ticket });
});

module.exports = {
  listTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  updateTicketPriority,
};

