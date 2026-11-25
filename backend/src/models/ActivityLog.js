const mongoose = require('mongoose');

const ACTIVITY_ACTIONS = [
  'TICKET_CREATED',
  'TICKET_UPDATED',
  'STATUS_CHANGED',
  'COMMENT_ADDED',
  'TICKET_RESOLVED',
];

const activityLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

activityLogSchema.index({ ticket: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
module.exports.ACTIVITY_ACTIONS = ACTIVITY_ACTIONS;

