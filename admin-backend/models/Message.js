const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'outbound' },
  status: { type: String, enum: ['sent', 'delivered', 'failed', 'received'], default: 'sent' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
