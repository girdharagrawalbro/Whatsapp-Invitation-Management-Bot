const nodeCron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
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

      const admins = await User.find({ role: 'admin', isActive: true });

      for (const admin of admins) {
        try {
          // Find all users in this org who want daily PDFs
          const users = await User.find({ 
            orgId: admin._id, 
            'preferences.dailyPdf': true,
            isActive: true 
          });

          for (const user of users) {
            try {
              const events = await Event.find({ 
                orgId: admin._id,
                userId: user._id,
                eventDate: { $gte: today, $lt: tomorrow }
              }).sort({ eventTime: 1 });

              if (events.length > 0) {
                const { longUrl } = await generatePdf(events, true, admin);
                await sendWhatsAppMessage(user.phone, '🌞 सुप्रभात! आपके आज के कार्यक्रम ।', longUrl);
              }
            } catch (userError) {
              console.error(`Error sending daily PDF to user ${user.phone}:`, userError);
            }
          }
        } catch (orgError) {
          console.error(`Error processing daily notifications for admin ${admin.name}:`, orgError);
        }
      }

    } catch (error) {
      console.error('Error in daily notification scheduler:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  
  console.log('\x1b[32m%s\x1b[0m', '✓ Personalized daily notifications scheduled for 6:00 AM IST');
}

// Send reminder message for one event
async function sendReminder(event) {
  try {
    const user = await User.findById(event.userId);
    if (!user) throw new Error(`User not found for event ${event._id}`);

    const recipient = user.phone;
    const reminderMessage = `🔔 रिमाइंडर: \n\n${formatEventList([event])}\n\n`;
    
    await sendWhatsAppMessage(recipient, reminderMessage);
    await Event.findByIdAndUpdate(event._id, { 'reminder.sent': true, 'reminder.sentAt': new Date() });

    console.log(`[Reminder] Sent reminder for event: ${event._id} to ${recipient}`);
  } catch (error) {
    console.error(`[Reminder] Failed to send reminder for event ${event._id}:`, error.message);
  }
}

// Schedule reminders using cron - checks every 5 minutes
function scheduleEventReminders() {
  nodeCron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const upcomingEvents = await Event.find({
        eventDate: { 
          $gte: today, // Today's events
          $lte: tomorrow // Safety check
        },
        'reminder.sent': false,
        'reminder.scheduledAt': {
          $lte: oneHourFromNow,
          $gte: now
        }
      });

      for (const event of upcomingEvents) {
        await sendReminder(event);
      }
    } catch (error) {
      console.error('[ERROR] Failed to process event reminders:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('\x1b[32m%s\x1b[0m', '✓ Multi-tenant event reminders scheduler started');
}

function formatEventList(events) {
  return events.map(event =>
    `# ${event.title} \n ( ${event.eventDate.toLocaleDateString('en-IN')} - ${event.eventTime} )\n \nस्थान: ${event.venue?.address || event.address} \n आयोजक: ${event.hostName || event.organizer}\n संपर्क: ${event.contactPhone || ""}\n link: ${event.mediaUrl}\n \n`
  ).join('\n');
}

module.exports = {
  scheduleDailyNotifications,
  scheduleEventReminders,
  sendReminder,
};
