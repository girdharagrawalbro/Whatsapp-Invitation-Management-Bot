const nodeCron = require('node-cron');
const ScheduledMessage = require('../models/ScheduledMessage');
const { messageQueue } = require('./messageQueue');
const logger = require('./logger');

/**
 * Process and schedule messages due for sending
 */
async function processScheduledMessages() {
  try {
    const now = new Date();
    
    // Find all scheduled messages that are due
    const pendingMessages = await ScheduledMessage.find({
      scheduledTime: { $lte: now },
      status: 'scheduled'
    });

    if (pendingMessages.length === 0) {
      return;
    }

    logger.info(`[SCHEDULER] Found ${pendingMessages.length} pending message batches`);

    for (const batch of pendingMessages) {
      await enqueueBatch(batch);
    }
  } catch (error) {
    logger.error(`[SCHEDULER ERROR] ${error.message}`);
  }
}

/**
 * Add each recipient in a batch to the BullMQ queue
 */
async function enqueueBatch(batch) {
  try {
    // Mark batch as processing
    await ScheduledMessage.findByIdAndUpdate(batch._id, { status: 'processing' });

    const jobs = batch.users.map(phone => ({
      name: `send-${phone}`,
      data: {
        userPhone: phone,
        message: batch.message,
        scheduledMessageId: batch._id
      }
    }));

    // Add all recipients as separate jobs to the queue
    await messageQueue.addBulk(jobs);

    // Update batch status to 'enqueued' (or just keep as processing until worker finishes)
    await ScheduledMessage.findByIdAndUpdate(batch._id, { 
      status: 'sent', // Simplified for now, or track actual completion in worker
      completedAt: new Date()
    });

    logger.info(`[SCHEDULER] Enqueued ${jobs.length} jobs for batch ${batch._id}`);

  } catch (error) {
    logger.error(`[SCHEDULER ERROR] Failed to enqueue batch ${batch._id}: ${error.message}`);
    await ScheduledMessage.findByIdAndUpdate(batch._id, { status: 'failed' });
  }
}

/**
 * Initialize the message scheduler
 */
function initializeMessageScheduler() {
  // Run every minute
  nodeCron.schedule('* * * * *', async () => {
    await processScheduledMessages();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Check immediately on startup
  setTimeout(async () => {
    logger.info('⏳ Checking for pending scheduled messages...');
    await processScheduledMessages();
  }, 5000);

  logger.info('✓ Message scheduler initialized (BullMQ powered)');
}

module.exports = {
  initializeMessageScheduler,
  processScheduledMessages
};

