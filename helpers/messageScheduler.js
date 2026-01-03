const nodeCron = require('node-cron');
const ScheduledMessage = require('../models/ScheduledMessage');
const User = require('../models/User');
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Process and send scheduled messages
 * This function is called by the cron job to process pending messages
 */
async function processScheduledMessages() {
  try {
    const now = new Date();
    
    // Find all scheduled messages that are due (scheduled time has passed and status is 'scheduled')
    const pendingMessages = await ScheduledMessage.find({
      scheduledTime: { $lte: now },
      status: 'scheduled'
    });

    if (pendingMessages.length === 0) {
      return;
    }

    console.log(`[${new Date().toISOString()}] Processing ${pendingMessages.length} scheduled messages`);

    for (const scheduledMessage of pendingMessages) {
      await sendScheduledMessage(scheduledMessage);
    }
  } catch (error) {
    console.error('[ERROR] Failed to process scheduled messages:', error.message);
  }
}

/**
 * Send a single scheduled message to all its recipients
 */
async function sendScheduledMessage(scheduledMessage) {
  const results = [];
  let allSuccessful = true;

  try {
    // Mark as processing to prevent duplicate sends
    await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, { status: 'processing' });

    for (const userPhone of scheduledMessage.users) {
      try {
        // Check if user has opted out
        const user = await User.findOne({ phone: userPhone.replace(/\D/g, '') });
        if (user?.optOut) {
          results.push({ phone: userPhone, status: 'skipped', error: 'User has opted out' });
          continue;
        }

        await twilio.messages.create({
          body: scheduledMessage.message,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${userPhone}`
        });

        results.push({ phone: userPhone, status: 'sent' });
        
        // Update user's last interaction
        if (user) {
          await User.findByIdAndUpdate(user._id, { lastInteraction: new Date() });
        }

      } catch (err) {
        console.error(`Error sending message to ${userPhone}:`, err.message);
        results.push({ phone: userPhone, status: 'failed', error: err.message });
        allSuccessful = false;
      }

      // Rate limiting - wait 1 second between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update message status
    await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, {
      status: allSuccessful ? 'sent' : 'failed',
      results,
      completedAt: new Date()
    });

    console.log(`[${new Date().toISOString()}] Campaign ${scheduledMessage.campaign || 'general'} completed with ${results.length} messages`);

  } catch (error) {
    console.error(`[ERROR] Failed to send scheduled message ${scheduledMessage._id}:`, error.message);
    await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, {
      status: 'failed',
      results,
      completedAt: new Date()
    });
  }
}

/**
 * Initialize the message scheduler
 * Runs every minute to check for due messages
 */
function initializeMessageScheduler() {
  // Run every minute to check for scheduled messages
  nodeCron.schedule('* * * * *', async () => {
    await processScheduledMessages();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Also process any pending messages immediately on startup
  // (in case server was down when messages were scheduled)
  setTimeout(async () => {
    console.log('\x1b[33m%s\x1b[0m', '⏳ Checking for pending scheduled messages...');
    await processScheduledMessages();
  }, 5000); // Wait 5 seconds for DB connection

  console.log('\x1b[32m%s\x1b[0m', '✓ Message scheduler initialized (checking every minute)');
}

module.exports = {
  initializeMessageScheduler,
  processScheduledMessages,
  sendScheduledMessage
};
