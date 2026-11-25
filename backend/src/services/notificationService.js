const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

async function getUserNotifications(userId) {
  return Notification.find({ recipient: userId })
    .populate('ticket', 'title status priority')
    .sort({ createdAt: -1 });
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (String(notification.recipient) !== String(userId)) {
    throw new ApiError(403, 'You do not have permission to update this notification');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
}

module.exports = {
  getUserNotifications,
  markAsRead,
};

