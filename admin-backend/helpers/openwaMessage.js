const OpenWAClient = require('../config/openwa');
const logger = require('./logger');

/**
 * OpenWA Message Handler
 * Drop-in replacement for Twilio-based WhatsApp messaging
 * 
 * Supports the same interface as whatsappSender.js but uses OpenWA backend
 */

class OpenWAMessageHandler {
  constructor(options = {}) {
    this.client = new OpenWAClient(options);
  }

  /**
   * Send text message via OpenWA
   * 
   * @param {string} to - Phone number (with or without whatsapp: prefix)
   * @param {string} text - Message text
   * @param {object} options - Additional options
   */
  async sendText(to, text, options = {}) {
    try {
      const chatId = this._formatChatId(to);
      
      if (!text) {
        throw new Error('Message text is required');
      }

      logger.info(`📱 [OpenWA] Sending text to ${chatId}`);

      const result = await this.client.sendText(chatId, text, options);
      
      logger.info(`✓ [OpenWA] Text message sent. ID: ${result.messageId || result.id}`);
      return {
        messageId: result.messageId || result.id,
        status: result.status || 'sent',
        timestamp: new Date(),
        provider: 'openwa'
      };

    } catch (error) {
      logger.error(`❌ [OpenWA] Failed to send text: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Send media (image, video, document, audio)
   * 
   * @param {string} to - Phone number
   * @param {string} mediaUrl - URL to media file
   * @param {string} caption - Caption text
   * @param {string} mediaType - 'image' | 'video' | 'document' | 'audio'
   * @param {object} options - Additional options
   */
  async sendMedia(to, mediaUrl, caption = '', mediaType = 'image', options = {}) {
    try {
      const chatId = this._formatChatId(to);

      if (!mediaUrl) {
        throw new Error('Media URL is required');
      }

      logger.info(`📷 [OpenWA] Sending ${mediaType} to ${chatId}: ${mediaUrl}`);

      const result = await this.client.sendMedia(chatId, mediaUrl, caption, mediaType, options);

      logger.info(`✓ [OpenWA] Media sent. ID: ${result.messageId || result.id}`);
      return {
        messageId: result.messageId || result.id,
        status: result.status || 'sent',
        timestamp: new Date(),
        provider: 'openwa'
      };

    } catch (error) {
      logger.error(`❌ [OpenWA] Failed to send media: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Send buttons (quick replies)
   * 
   * @param {string} to - Phone number
   * @param {array} buttons - Array of { id, text }
   * @param {string} text - Header text
   * @param {object} options - Additional options
   */
  async sendButtons(to, buttons, text = '', options = {}) {
    try {
      const chatId = this._formatChatId(to);

      if (!buttons || buttons.length === 0) {
        throw new Error('At least one button is required');
      }

      logger.info(`🔘 [OpenWA] Sending ${buttons.length} buttons to ${chatId}`);

      const result = await this.client.sendButtons(chatId, buttons, text, options);

      logger.info(`✓ [OpenWA] Buttons sent. ID: ${result.messageId || result.id}`);
      return {
        messageId: result.messageId || result.id,
        status: result.status || 'sent',
        timestamp: new Date(),
        provider: 'openwa'
      };

    } catch (error) {
      logger.error(`❌ [OpenWA] Failed to send buttons: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send interactive list
   * 
   * @param {string} to - Phone number
   * @param {object} config - { title, description, sections }
   * @param {object} options - Additional options
   */
  async sendList(to, config, options = {}) {
    try {
      const chatId = this._formatChatId(to);

      if (!config.sections || config.sections.length === 0) {
        throw new Error('At least one section is required');
      }

      logger.info(`📋 [OpenWA] Sending list to ${chatId}`);

      const result = await this.client.sendList(
        chatId,
        config.title,
        config.description,
        config.sections,
        config.text,
        options
      );

      logger.info(`✓ [OpenWA] List sent. ID: ${result.messageId || result.id}`);
      return {
        messageId: result.messageId || result.id,
        status: result.status || 'sent',
        timestamp: new Date(),
        provider: 'openwa'
      };

    } catch (error) {
      logger.error(`❌ [OpenWA] Failed to send list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if session is active
   */
  async isSessionActive() {
    try {
      const status = await this.client.getSessionStatus(this.client.sessionId);
      return status.status === 'CONNECTED' || status.status === 'AUTHENTICATED';
    } catch (error) {
      logger.error(`❌ [OpenWA] Session check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get session QR code
   */
  async getQRCode() {
    try {
      return await this.client.getQRCode(this.client.sessionId);
    } catch (error) {
      logger.error(`❌ [OpenWA] Failed to get QR code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Private helper to format phone numbers to WhatsApp chat ID format
   * Converts 919876543210 → 919876543210@c.us
   */
  _formatChatId(to) {
    if (!to) return null;
    
    // Remove all non-digits
    let cleaned = to.replace(/\D/g, '');
    
    // Add @c.us suffix if not present
    if (!cleaned.includes('@')) {
      cleaned = `${cleaned}@c.us`;
    }
    
    return cleaned;
  }

  }

// Export both class and singleton instance
let instance = null;

function getOpenWAHandler(options = {}) {
  if (!instance) {
    instance = new OpenWAMessageHandler(options);
  }
  return instance;
}

module.exports = {
  OpenWAMessageHandler,
  getOpenWAHandler
};
