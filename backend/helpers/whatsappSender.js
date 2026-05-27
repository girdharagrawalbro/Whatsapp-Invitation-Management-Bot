const { getOpenWAHandler } = require('./openwaMessage');
const logger = require('./logger');

async function sendWhatsAppMessage(to, message, mediaUrl = null) {
  const handler = getOpenWAHandler();

  if (!to) {
    throw new Error('Recipient phone number is required');
  }

  try {
    if (mediaUrl) {
      return await handler.sendMedia(to, mediaUrl, message || '', 'document');
    }

    return await handler.sendText(to, message || '');
  } catch (error) {
    logger.error(`[WhatsAppSender] Failed to send message to ${to}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  sendWhatsAppMessage,
};