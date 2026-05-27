const crypto = require('crypto');
const User = require('../models/User');
const logger = require('./logger');

/**
 * OpenWA Webhook Handler
 * Processes incoming webhooks from OpenWA server
 * 
 * Handles:
 * - Incoming messages
 * - Delivery receipts
 * - Read receipts
 * - Session status changes
 * - Group events
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

      // Update user last interaction
      const phoneClean = from.replace(/\D/g, '');
      await User.findOneAndUpdate(
        { phone: phoneClean },
        { 
          lastActiveAt: new Date(),
          lastReceivedMessage: body,
          lastMessageTime: new Date(timestamp)
        },
        { upsert: true, new: true }
      );

      // Process message based on type
      let result = {
        messageId,
        status: 'processed',
        from,
        timestamp
      };

      if (body.toLowerCase() === 'stop' || body.toLowerCase() === 'no') {
        // Handle opt-out
        result = await this._handleOptOut(phoneClean, from);
      } else if (body.toLowerCase() === 'yes' || body.toLowerCase() === 'start') {
        // Handle opt-in
        result = await this._handleOptIn(phoneClean, from);
      } else {
        // Forward to chatbot/AI processing
        result = await this._forwardToChatbot(from, body, mediaUrl);
      }

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

      // Update message record in database if tracking
      // This would depend on your message tracking implementation
      // For now, just log it

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

      // Log session events
      const sessionLog = {
        sessionId,
        status,
        message,
        timestamp: new Date(),
        action: 'status_change'
      };

      // Could save to database for monitoring
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

      // Handle group operations
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
    // Verify signature
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

  /**
   * Private: Handle opt-out
   */
  async _handleOptOut(phoneClean, from) {
    try {
      await User.findOneAndUpdate(
        { phone: phoneClean },
        { optOut: true, optOutAt: new Date() },
        { new: true }
      );

      logger.info(`🚫 User ${from} opted out`);
      return { status: 'opted_out', from };

    } catch (error) {
      logger.error(`Error handling opt-out: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Private: Handle opt-in
   */
  async _handleOptIn(phoneClean, from) {
    try {
      await User.findOneAndUpdate(
        { phone: phoneClean },
        { optOut: false },
        { new: true }
      );

      logger.info(`✅ User ${from} opted in`);
      return { status: 'opted_in', from };

    } catch (error) {
      logger.error(`Error handling opt-in: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Private: Forward to chatbot/AI
   * This is a placeholder - integrate with your chatbot logic
   */
  async _forwardToChatbot(from, message, mediaUrl) {
    try {
      // TODO: Integrate with your AI/chatbot service
      // Examples:
      // - Send to Gemini API
      // - Send to custom chatbot handler
      // - Trigger workflow

      logger.debug(`📤 Forwarding to chatbot: ${message}`);

      return {
        status: 'forwarded',
        from,
        message,
        target: 'chatbot'
      };

    } catch (error) {
      logger.error(`Error forwarding to chatbot: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }
}

module.exports = OpenWAWebhookHandler;
