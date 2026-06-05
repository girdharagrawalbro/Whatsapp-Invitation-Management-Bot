const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role === 'admin' || this.role === 'superadmin';
      },
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    openwa: {
      sessionId: { type: String, default: null },
      status: { type: String, default: null },
      phone: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingStatus: {
      type: String,
      enum: ['pending', 'provisioning', 'complete'],
      default: 'pending',
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ 'openwa.sessionId': 1 });

module.exports = mongoose.model('AdminUser', userSchema);