const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      enum: ['admin', 'user', 'superadmin'],
      default: 'admin',
    },

    // If role is 'user', this points to the admin user who owns the account
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // OpenWA connection credentials (only for admin users)
    openwa: {
      sessionId: { type: String, default: null },
      status: { type: String, default: null },
      phone: { type: String, default: null },
    },

    // Subscription / plan
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'member'],
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Daily PDF send time (IST, 24h format)
    dailyBriefingHour: { type: Number, default: 6 },
    dailyBriefingMinute: { type: Number, default: 0 },

    // Language preference
    defaultLanguage: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    onboardingStatus: {
      type: String,
      enum: ['pending', 'provisioning', 'complete'],
      default: 'pending',
    },
    isServicePaused: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      dailyBriefing: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index on openwa.sessionId for fast lookup
userSchema.index({ 'openwa.sessionId': 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);