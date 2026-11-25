const Notification = require('../../models/Notification');
const User = require('../../models/User');
const EVENTS = require('../events');

async function notifyAdmins({ ticket, type, message, excludeUserId }) {
  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  const recipients = admins.filter(
    (admin) => !excludeUserId || String(admin._id) !== String(excludeUserId)
  );

  if (recipients.length === 0) {
    return;
  }

  await Notification.insertMany(
    recipients.map((admin) => ({
      recipient: admin._id,
      ticket: ticket._id,
      type,
      message,
    }))
  );
}

function registerNotificationListeners(eventBus) {
  eventBus.on(EVENTS.TICKET_CREATED, async ({ ticket, actor }) => {
    try {
      await notifyAdmins({
        ticket,
        type: 'TICKET_CREATED',
        message: `New ticket "${ticket.title}" created by ${actor.name || 'a user'}.`,
        excludeUserId: actor._id,
      });
    } catch (error) {
      console.error('[NotificationListener] Error handling ticket.created:', error);
    }
  });

  eventBus.on(EVENTS.TICKET_STATUS_CHANGED, async ({ ticket, actor, oldStatus, newStatus }) => {
    try {
      const ticketOwnerId = ticket.createdBy?._id || ticket.createdBy;
      if (actor.role !== 'admin' || String(ticketOwnerId) === String(actor._id)) {
        return;
      }

      await Notification.create({
        recipient: ticketOwnerId,
        ticket: ticket._id,
        type: newStatus === 'resolved' ? 'TICKET_RESOLVED' : 'STATUS_CHANGED',
        message: `Your ticket "${ticket.title}" status changed from "${oldStatus}" to "${newStatus}".`,
      });
    } catch (error) {
      console.error('[NotificationListener] Error handling ticket.statusChanged:', error);
    }
  });

  eventBus.on(EVENTS.COMMENT_ADDED, async ({ ticket, actor }) => {
    try {
      const ticketOwnerId = ticket.createdBy?._id || ticket.createdBy;

      if (actor.role === 'admin') {
        if (String(ticketOwnerId) !== String(actor._id)) {
          await Notification.create({
            recipient: ticketOwnerId,
            ticket: ticket._id,
            type: 'COMMENT_ADDED',
            message: `An admin commented on your ticket "${ticket.title}".`,
          });
        }
        return;
      }

      await notifyAdmins({
        ticket,
        type: 'COMMENT_ADDED',
        message: `${actor.name || 'User'} commented on ticket "${ticket.title}".`,
        excludeUserId: actor._id,
      });
    } catch (error) {
      console.error('[NotificationListener] Error handling comment.added:', error);
    }
  });
}

module.exports = registerNotificationListeners;

