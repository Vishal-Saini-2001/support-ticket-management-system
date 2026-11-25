const statsService = require('../services/statsService');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getStats(req.user);
  res.status(200).json(stats);
});

module.exports = {
  getStats,
};

