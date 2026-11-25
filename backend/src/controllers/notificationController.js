const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user._id);
  res.status(200).json({ data: notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json({ data: notification });
});

module.exports = {
  getNotifications,
  markNotificationRead,
};

