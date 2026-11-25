const mongoose = require('mongoose');

const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: 'medium',
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
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

ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
module.exports.TICKET_PRIORITIES = TICKET_PRIORITIES;
module.exports.TICKET_STATUSES = TICKET_STATUSES;

