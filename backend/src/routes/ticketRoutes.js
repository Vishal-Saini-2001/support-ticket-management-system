const express = require('express');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const activityController = require('../controllers/activityController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  ticketIdParamSchema,
  createTicketSchema,
  updateTicketSchema,
  listTicketsSchema,
  updateStatusSchema,
  updatePrioritySchema,
} = require('../validators/ticketValidator');
const { createCommentSchema } = require('../validators/commentValidator');

const router = express.Router();

router.use(auth);

router
  .route('/')
  .get(validate(listTicketsSchema), ticketController.listTickets)
  .post(validate(createTicketSchema), ticketController.createTicket);

router
  .route('/:id')
  .get(validate(ticketIdParamSchema), ticketController.getTicketById)
  .put(validate(updateTicketSchema), ticketController.updateTicket)
  .delete(validate(ticketIdParamSchema), ticketController.deleteTicket);

router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateStatusSchema),
  ticketController.updateTicketStatus
);

router.patch(
  '/:id/priority',
  authorize('admin'),
  validate(updatePrioritySchema),
  ticketController.updateTicketPriority
);

router
  .route('/:id/comments')
  .get(validate(ticketIdParamSchema), commentController.getComments)
  .post(validate(createCommentSchema), commentController.createComment);

router.get('/:id/activity', validate(ticketIdParamSchema), activityController.getTicketActivity);

module.exports = router;

