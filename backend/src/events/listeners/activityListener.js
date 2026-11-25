const ActivityLog = require('../../models/ActivityLog');
const EVENTS = require('../events');

async function recordActivity({ ticketId, actorId, action, meta = {} }) {
  try {
    await ActivityLog.create({
      ticket: ticketId,
      actor: actorId,
      action,
      meta,
    });
  } catch (error) {
    console.error(`[ActivityListener] Failed to write ${action} log:`, error);
  }
}

function registerActivityListeners(eventBus) {
  eventBus.on(EVENTS.TICKET_CREATED, async ({ ticket, actor }) => {
    await recordActivity({
      ticketId: ticket._id,
      actorId: actor._id,
      action: 'TICKET_CREATED',
      meta: {
        new: {
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
        },
      },
    });
  });

  eventBus.on(EVENTS.TICKET_UPDATED, async ({ ticket, actor, oldValues, newValues }) => {
    await recordActivity({
      ticketId: ticket._id,
      actorId: actor._id,
      action: 'TICKET_UPDATED',
      meta: {
        old: oldValues,
        new: newValues,
      },
    });
  });

  eventBus.on(EVENTS.TICKET_STATUS_CHANGED, async ({ ticket, actor, oldStatus, newStatus }) => {
    await recordActivity({
      ticketId: ticket._id,
      actorId: actor._id,
      action: 'STATUS_CHANGED',
      meta: {
        old: { status: oldStatus },
        new: { status: newStatus },
      },
    });
  });

  eventBus.on(EVENTS.COMMENT_ADDED, async ({ ticket, comment, actor }) => {
    await recordActivity({
      ticketId: ticket._id,
      actorId: actor._id,
      action: 'COMMENT_ADDED',
      meta: {
        commentId: comment._id,
      },
    });
  });

  eventBus.on(EVENTS.TICKET_RESOLVED, async ({ ticket, actor }) => {
    await recordActivity({
      ticketId: ticket._id,
      actorId: actor._id,
      action: 'TICKET_RESOLVED',
      meta: {
        resolvedAt: ticket.resolvedAt,
      },
    });
  });
}

module.exports = registerActivityListeners;

