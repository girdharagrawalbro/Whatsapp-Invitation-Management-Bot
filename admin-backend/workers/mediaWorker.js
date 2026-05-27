const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { connection } = require('../config/queue');
const { extractEventDetailsFromMedia } = require('../helpers/eventExtractor');
const { downloadMediaFile } = require('../helpers/mediaHandler');
const { getNextEventIndex, saveEvent } = require('../helpers/eventManager');
const User = require('../models/User');

const mediaWorker = new Worker('media-processing', async (job) => {
  const { mediaUrl, contentType, from, organizationId, userId, adminPhone } = job.data;
  
  console.log(`[MediaWorker] Processing job ${job.id} for ${from}`);

  try {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const getMediaType = (type) => {
      if (type.startsWith('image/')) return 'image';
      if (type === 'application/pdf') return 'pdf';
      if (type.startsWith('video/')) return 'video';
      if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'excel';
      return null;
    };

    const getFileExtension = (type) => {
      const extensions = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
        'application/pdf': 'pdf', 'video/mp4': 'mp4', 'video/quicktime': 'mov',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
      };
      return extensions[type] || 'bin';
    };

    const mediaType = getMediaType(contentType);
    if (!mediaType) return;

    const extension = getFileExtension(contentType);
    const filePath = path.join(tempDir, `event-${Date.now()}.${extension}`);
    
    // Download and upload to storage (Cloudinary handled inside downloadMediaFile likely)
    const { mediaUrls } = await downloadMediaFile(mediaUrl, filePath);

    // AI Extraction
    const eventDetails = await extractEventDetailsFromMedia(filePath, mediaType);

    // Cleanup local file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Save events with isolation
    for (const eventData of eventDetails) {
      await saveEvent({ 
        eventData, 
        mediaUrls, 
        mediaType, 
        from, 
        orgId: organizationId,
        userId: userId 
      });
    }

    // Notify Admin via OpenWA (with Twilio fallback)
    const { getOpenWAHandler } = require('../helpers/openwaMessage');
    const waHandler = getOpenWAHandler({
      sessionId: `org-${organizationId}`,
      fallbackToTwilio: true
    });

    const confirmMessage = `🎉 *Invitely Notification*
Great news! We've successfully processed your invitation card.

All details have been extracted and added to your dashboard. You can now view events and manage RSVPs!`;

    await waHandler.sendText(adminPhone, confirmMessage).catch(err => {
      console.error(`[MediaWorker] Failed to send OpenWA notification: ${err.message}`);
    });

    return { success: true, eventCount: eventDetails.length };

  } catch (error) {
    console.error(`[MediaWorker] Error in job ${job.id}:`, error);
    throw error;
  }
}, { connection });

mediaWorker.on('completed', job => {
  console.log(`[MediaWorker] Job ${job.id} completed`);
});

mediaWorker.on('failed', (job, err) => {
  console.error(`[MediaWorker] Job ${job.id} failed:`, err);
});

module.exports = mediaWorker;
