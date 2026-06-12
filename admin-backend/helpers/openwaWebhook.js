const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');
const logger = require('./logger');

/**
 * OpenWA Webhook Handler
 * Processes incoming webhooks from OpenWA server
 */

class OpenWAWebhookHandler {
  constructor(secret = '') {
    this.secret = secret || process.env.OPENWA_WEBHOOK_SECRET || '';
  }

  /**
   * Verify webhook signature (HMAC-SHA256)
   */
  verifySignature(body, signature) {
    if (!this.secret) {
      logger.warn('⚠️ OPENWA_WEBHOOK_SECRET not set. Signature verification disabled.');
      return true;
    }

    try {
      const hash = crypto
        .createHmac('sha256', this.secret)
        .update(JSON.stringify(body))
        .digest('hex');

      const isValid = hash === signature;
      
      if (!isValid) {
        logger.warn('❌ Webhook signature verification failed');
      }

      return isValid;
    } catch (error) {
      logger.error(`❌ Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle incoming message webhook
   */
  async handleMessageReceived(data) {
    const { from, body, mediaUrl, timestamp, messageId, isGroup } = data;

    try {
      logger.info(`📨 [Webhook] Message received from ${from}: "${body.substring(0, 50)}..."`);

      // Update admin user last interaction
      const phoneClean = from.replace(/\D/g, '');
      await AdminUser.findOneAndUpdate(
        { phone: phoneClean },
        { 
          lastActiveAt: new Date()
        },
        { new: true }
      );

      // Process message based on type
      let result = {
        messageId,
        status: 'processed',
        from,
        timestamp
      };

      return result;

    } catch (error) {
      logger.error(`❌ [Webhook] Failed to handle message: ${error.message}`);
      return {
        messageId,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Handle message status update (delivery/read receipts)
   */
  async handleMessageStatus(data) {
    const { messageId, status, timestamp, from } = data;

    try {
      logger.info(`📊 [Webhook] Message ${messageId} status: ${status}`);

      return {
        messageId,
        status: 'updated',
        newStatus: status,
        timestamp
      };

    } catch (error) {
      logger.error(`❌ [Webhook] Failed to handle status: ${error.message}`);
      return { messageId, status: 'failed', error: error.message };
    }
  }

  /**
   * Handle session status change
   */
  async handleSessionStatus(data) {
    const { sessionId, status, message } = data;

    try {
      logger.info(`🔄 [Webhook] Session ${sessionId} status: ${status}`);

      const sessionLog = {
        sessionId,
        status,
        message,
        timestamp: new Date(),
        action: 'status_change'
      };

      logger.debug(`Session event: ${JSON.stringify(sessionLog)}`);

      return {
        sessionId,
        status: 'logged',
        action: 'status_change'
      };

    } catch (error) {
      logger.error(`❌ [Webhook] Failed to handle session status: ${error.message}`);
      return { sessionId, status: 'failed', error: error.message };
    }
  }

  /**
   * Handle group events (member join/leave, etc.)
   */
  async handleGroupEvent(data) {
    const { groupId, event, participant, timestamp } = data;

    try {
      logger.info(`👥 [Webhook] Group ${groupId} event: ${event} by ${participant}`);

      let result = {
        groupId,
        event,
        participant,
        timestamp,
        status: 'logged'
      };

      return result;

    } catch (error) {
      logger.error(`❌ [Webhook] Failed to handle group event: ${error.message}`);
      return { groupId, event, status: 'failed', error: error.message };
    }
  }

  /**
   * Generic webhook handler that routes to specific handlers
   */
  async handleWebhook(body, signature) {
    if (!this.verifySignature(body, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const { eventType, data } = body;

    try {
      let result;

      switch (eventType) {
        case 'message.received':
          result = await this.handleMessageReceived(data);
          break;

        case 'message.ack':
        case 'message.status':
          result = await this.handleMessageStatus(data);
          break;

        case 'session.status':
          result = await this.handleSessionStatus(data);
          break;

        case 'group.event':
          result = await this.handleGroupEvent(data);
          break;

        default:
          logger.warn(`⚠️ [Webhook] Unknown event type: ${eventType}`);
          result = { eventType, status: 'unknown' };
      }

      return {
        success: true,
        eventType,
        result
      };

    } catch (error) {
      logger.error(`❌ [Webhook] Handler error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = OpenWAWebhookHandler;
