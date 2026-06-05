const mongoose = require('mongoose');

const ScheduledMessageSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  message: String,
  users: [{ type: String }],
  scheduledTime: Date,
  status: { type: String, enum: ['scheduled', 'sent', 'failed'], default: 'scheduled' },
  hidden: { type: Boolean, default: false },
  campaign: String,
  audience: { type: String, enum: ['all', 'invitation', 'contact'], default: 'all' },
  results: [
    {
      phone: String,
      status: String,
      error: String
    }
  ],
  completedAt: Date
});

module.exports = mongoose.model('ScheduledMessage', ScheduledMessageSchema);
