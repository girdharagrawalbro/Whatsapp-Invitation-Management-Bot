const nodeCron = require('node-cron');
const Event = require('../models/Event');

// Schedule daily 6 AM notification with today's events
const { sendWhatsAppMessage } = require('./whatsappSender');
const { generatePdf } = require('./generatePdf');

function scheduleDailyNotifications() {
  // Run at 6:00 AM IST every day
  nodeCron.schedule('0 6 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const events = await Event.find({ date: { $gte: today, $lt: tomorrow }, status: 'confirmed' }).sort({ time: 1 });
      const adminPhone = process.env.ADMIN_PHONE_NUMBER;

      if (!adminPhone) {
        console.error('ADMIN_PHONE_NUMBER not set in environment variables');
        return;
      }

      if (events.length > 0) {
        const { longUrl } = await generatePdf(events);
        await sendWhatsAppMessage(adminPhone, '🌞 सुप्रभात! आज के कार्यक्रम ।', longUrl);

      } else {
        await sendWhatsAppMessage(adminPhone, '🌞 सुप्रभात! आज के लिए कोई कार्यक्रम नहीं है।');
      }

    } catch (error) {
      console.error('Error in daily notification:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  
  console.log('\x1b[32m%s\x1b[0m', '✓ Daily notifications scheduled for 6:00 AM IST');
}


// Send reminder message for one event
async function sendReminder(event) {
  try {
    const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER;
    if (!ADMIN_PHONE) throw new Error('Admin phone not configured');

    const reminderMessage = `🔔 Reminder: \n\n${formatEventList([event])}\n\n`;
    await sendWhatsAppMessage(ADMIN_PHONE, reminderMessage);

    await Event.findByIdAndUpdate(event._id, { reminderSent: true });

    console.log(`[${new Date().toISOString()}] Sent reminder for event: ${event._id}`);
  } catch (error) {
    console.error(`[ERROR] Failed to send reminder for event ${event._id}:`, error.message);
  }
}

// Schedule reminders using cron - checks every 5 minutes for events starting in the next hour
function scheduleEventReminders() {
  // Run every 5 minutes to check for upcoming events
  nodeCron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Find events that:
      // 1. Start within the next hour (but more than 55 minutes away to avoid duplicates)
      // 2. Haven't had a reminder sent
      // 3. Are confirmed
      const upcomingEvents = await Event.find({
        date: { 
          $gte: new Date(now.getTime() + 55 * 60 * 1000), // At least 55 min from now
          $lte: oneHourFromNow // But within an hour
        },
        reminderSent: false,
        status: 'confirmed',
      });

      for (const event of upcomingEvents) {
        await sendReminder(event);
      }

      if (upcomingEvents.length > 0) {
        console.log(`[${new Date().toISOString()}] Processed ${upcomingEvents.length} event reminders`);
      }
    } catch (error) {
      console.error('[ERROR] Failed to process event reminders:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('\x1b[32m%s\x1b[0m', '✓ Event reminders scheduler started (checking every 5 minutes)');
}
// Format events list (example)
function formatEventList(events) {
  return events.map(event =>
    `# ${event.title} \n ( ${event.date.toLocaleDateString('en-IN')} - ${event.time} )\n \nस्थान: ${event.address} \n आयोजक: ${event.organizer}\n संपर्क: ${event.contactPhone ? event.contactPhone
      : ""
    }\n link: ${event.mediaUrls}\n \n`
  ).join('\n');
}

module.exports = {
  scheduleDailyNotifications,
  scheduleEventReminders,
  sendReminder,
};
