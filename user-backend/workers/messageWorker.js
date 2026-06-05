const { Worker } = require('bullmq');
const User = require('../models/User');
const ScheduledMessage = require('../models/ScheduledMessage');
const { getOpenWAHandler } = require('../helpers/openwaMessage');
const { redisOptions } = require('../helpers/messageQueue');
const logger = require('../helpers/logger');

const messageWorker = new Worker('whatsapp-messages', async job => {
  const { userPhone, message, scheduledMessageId } = job.data;
  
  try {
    // 1. Check opt-out status
    const user = await User.findOne({ phone: userPhone.replace(/\D/g, '') });
    if (user?.optOut) {
      logger.info(`Skipping message to ${userPhone} (Opted Out)`);
      return { status: 'skipped', reason: 'opt-out' };
    }

    // 2. Resolve dynamic OpenWA Session ID
    let sessionId = process.env.OPENWA_SESSION_ID || 'my-bot-session';
    if (scheduledMessageId) {
      const scheduledMessage = await ScheduledMessage.findById(scheduledMessageId);
      if (scheduledMessage && scheduledMessage.organizationId) {
        sessionId = `org-${scheduledMessage.organizationId}`;
      }
    }

    logger.info(`Routing message to ${userPhone} through session ${sessionId}`);

    // 3. Initialize dynamic handler (with automatic Twilio fallback if configured)
    const handler = getOpenWAHandler({
      sessionId,
      fallbackToTwilio: true
    });

    // 4. Send Message (OpenWA formatting formats to 919876543210@c.us)
    const result = await handler.sendText(userPhone, message);

    // 5. Update last interaction
    if (user) {
      await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });
    }

    logger.info(`Message sent successfully to ${userPhone} via ${result.provider}`);
    return { status: 'sent', provider: result.provider, messageId: result.messageId };

  } catch (error) {
    logger.error(`Failed to send message to ${userPhone}: ${error.message}`);
    throw error; // Let BullMQ handle the retry
  }
}, {
  connection: redisOptions,
  concurrency: 5 // Process 5 messages at a time
});

messageWorker.on('completed', async (job, result) => {
  // Optionally update the ScheduledMessage aggregate status
  logger.info(`Job ${job.id} completed`);
});

messageWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

module.exports = messageWorker;
