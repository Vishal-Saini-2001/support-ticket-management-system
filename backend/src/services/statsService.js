const Ticket = require('../models/Ticket');
const { TICKET_PRIORITIES, TICKET_STATUSES } = require('../models/Ticket');

async function getStats(user) {
  const matchStage = user.role === 'admin' ? {} : { createdBy: user._id };

  const [aggregated] = await Ticket.aggregate([
    { $match: matchStage },
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
      },
    },
  ]);

  const byStatus = Object.fromEntries(TICKET_STATUSES.map((s) => [s, 0]));
  const byPriority = Object.fromEntries(TICKET_PRIORITIES.map((p) => [p, 0]));

  for (const item of aggregated?.byStatus || []) {
    if (item._id in byStatus) {
      byStatus[item._id] = item.count;
    }
  }

  for (const item of aggregated?.byPriority || []) {
    if (item._id in byPriority) {
      byPriority[item._id] = item.count;
    }
  }

  const total = aggregated?.total?.[0]?.count || 0;

  return {
    total,
    byStatus,
    byPriority,
  };
}

module.exports = {
  getStats,
};

