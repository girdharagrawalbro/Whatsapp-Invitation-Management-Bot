const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    // Isolation keys — ALWAYS filter by both
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // AI-extracted fields from the invitation card
    title: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Sharma Wedding Reception"
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      default: null,
      // e.g. "7:00 PM" — stored as string since invitations often give
      // informal times; parsed for reminder scheduling
    },
    venue: {
      name: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
    },
    hostName: {
      type: String,
      default: null,
      // e.g. "Mr. & Mrs. Ramesh Sharma"
    },
    contactPhone: {
      type: String,
      default: null,
      // Contact number on the card (different from the user's phone)
    },
    notes: {
      type: String,
      default: null,
      // Any extra details Gemini extracted
    },

    // Original media
    mediaUrl: {
      type: String,
      default: null,
      // Cloudinary URL of the original forwarded image/PDF
    },
    mediaType: {
      type: String,
      enum: ['image', 'pdf', 'text', null],
      default: null,
    },

    // Raw Gemini extraction response (useful for debugging / re-processing)
    rawExtraction: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Extraction confidence from Gemini (0-1)
    extractionConfidence: {
      type: Number,
      default: null,
    },

    // Reminder job tracking
    reminder: {
      jobId: { type: String, default: null },    // BullMQ job ID
      scheduledAt: { type: Date, default: null }, // When reminder will fire
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
    },

    // Included in daily PDF?
    includedInPdf: {
      type: Boolean,
      default: false,
    },

    // RSVP status (if org uses RSVP tracking)
    rsvp: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'maybe'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Primary query pattern: "all events for this user in this org"
eventSchema.index({ orgId: 1, userId: 1 });

// For daily PDF and reminder jobs: "events today for this org's users"
eventSchema.index({ orgId: 1, eventDate: 1 });

// For user queries like "upcoming events"
eventSchema.index({ orgId: 1, userId: 1, eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);