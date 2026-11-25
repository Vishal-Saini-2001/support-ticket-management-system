const activityService = require('../services/activityService');
const asyncHandler = require('../utils/asyncHandler');

const getTicketActivity = asyncHandler(async (req, res) => {
  const logs = await activityService.getTicketActivity(req.params.id, req.user);
  res.status(200).json({ data: logs });
});

module.exports = {
  getTicketActivity,
};

