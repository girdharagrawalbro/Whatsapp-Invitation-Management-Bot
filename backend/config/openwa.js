const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../helpers/logger');

/**
 * OpenWA Client Configuration
 * Provides REST API wrapper for OpenWA server
 * 
 * Assumes OpenWA is running on OPENWA_URL (default: http://localhost:2785)
 */

class OpenWAClient {
  constructor(options = {}) {
    this.baseUrl = process.env.OPENWA_URL || 'http://localhost:2785/api';
    this.apiKeyCandidates = this._buildApiKeyCandidates();
    this.sessionId = options.sessionId || process.env.OPENWA_SESSION_ID;
    
    if (this.apiKeyCandidates.length === 0) {
      logger.warn('⚠️ No OpenWA API key configured. Requests may fail with 401.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  _buildApiKeyCandidates() {
    const workspaceKeyFile = path.resolve(__dirname, '../../OpenWA/data/.api-key');
    const fileKey = fs.existsSync(workspaceKeyFile)
      ? fs.readFileSync(workspaceKeyFile, 'utf8').trim()
      : null;

    const candidates = [
      fileKey,
      process.env.API_MASTER_KEY,
      process.env.OPENWA_API_KEY,
      process.env.OPENWA_MASTER_KEY,
      process.env.NODE_ENV !== 'production' ? 'dev-admin-key' : null,
    ]
      .filter(Boolean)
      .map(key => String(key).trim())
      .filter(key => key.length > 0);

    return [...new Set(candidates)];
  }

  async _requestWithApiKeyRetry(config) {
    let lastError = null;

    for (let index = 0; index < this.apiKeyCandidates.length; index += 1) {
      const apiKey = this.apiKeyCandidates[index];

      try {
        const response = await this.client.request({
          ...config,
          headers: {
            ...(config.headers || {}),
            'X-API-Key': apiKey,
          },
        });

        return response;
      } catch (error) {
        lastError = error;

        const isUnauthorized = error.response?.status === 401;
        const hasMoreCandidates = index < this.apiKeyCandidates.length - 1;

        if (!isUnauthorized || !hasMoreCandidates) {
          throw error;
        }

        logger.warn(`[OpenWA] API key rejected by server, trying fallback key ${index + 2}/${this.apiKeyCandidates.length}`);
      }
    }

    throw lastError;
  }

  /**
   * List all active sessions
   */
  async listSessions() {
    try {
      const response = await this._requestWithApiKeyRetry({ method: 'get', url: '/sessions' });
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to list sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionName) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: '/sessions',
        data: { name: sessionName },
      });
      logger.info(`[OpenWA] Session created: ${sessionName}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start a session and get QR code
   */
  async startSession(sessionId) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${sessionId}/start`,
      });
      logger.info(`[OpenWA] Session started: ${sessionId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to start session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get QR code for session (as base64 or URL)
   */
  async getQRCode(sessionId) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'get',
        url: `/sessions/${sessionId}/qr`,
      });
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to get QR code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'get',
        url: `/sessions/${sessionId}`,
      });
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to get session status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout session
   */
  async logoutSession(sessionId) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${sessionId}/logout`,
      });
      logger.info(`[OpenWA] Session logged out: ${sessionId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to logout session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send text message
   */
  async sendText(chatId, text, options = {}) {
    try {
      const payload = {
        chatId,
        text,
        ...options
      };

      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${this.sessionId}/messages/send-text`,
        data: payload,
      });

      logger.info(`[OpenWA] Message sent to ${chatId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to send text: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send media (image, video, audio, document)
   */
  async sendMedia(chatId, mediaUrl, caption = '', mediaType = 'image', options = {}) {
    try {
      const payload = {
        chatId,
        mediaUrl,
        caption,
        mediaType, // 'image' | 'video' | 'audio' | 'document'
        ...options
      };

      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${this.sessionId}/messages/send-media`,
        data: payload,
      });

      logger.info(`[OpenWA] Media sent to ${chatId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to send media: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send buttons
   */
  async sendButtons(chatId, buttons, text = '') {
    try {
      const payload = {
        chatId,
        text,
        buttons // Array of { id, text }
      };

      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${this.sessionId}/messages/send-buttons`,
        data: payload,
      });

      logger.info(`[OpenWA] Buttons sent to ${chatId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to send buttons: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send list message
   */
  async sendList(chatId, title, description, sections, text = '') {
    try {
      const payload = {
        chatId,
        text,
        title,
        description,
        sections // Array of { title, rows: [] }
      };

      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${this.sessionId}/messages/send-list`,
        data: payload,
      });

      logger.info(`[OpenWA] List sent to ${chatId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to send list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register webhook
   */
  async registerWebhook(webhookUrl, events = [], secret = '') {
    try {
      const payload = {
        url: webhookUrl,
        events, // ['message.received', 'message.ack', 'session.status']
        secret
      };

      const response = await this._requestWithApiKeyRetry({
        method: 'post',
        url: `/sessions/${this.sessionId}/webhooks`,
        data: payload,
      });

      logger.info(`[OpenWA] Webhook registered: ${webhookUrl}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to register webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get webhook list
   */
  async listWebhooks() {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'get',
        url: `/sessions/${this.sessionId}/webhooks`,
      });
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to list webhooks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId) {
    try {
      const response = await this._requestWithApiKeyRetry({
        method: 'delete',
        url: `/sessions/${this.sessionId}/webhooks/${webhookId}`,
      });
      logger.info(`[OpenWA] Webhook deleted: ${webhookId}`);
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Failed to delete webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check session health
   */
  async healthCheck() {
    try {
      const response = await this._requestWithApiKeyRetry({ method: 'get', url: '/health' });
      return response.data;
    } catch (error) {
      logger.error(`[OpenWA] Health check failed: ${error.message}`);
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = OpenWAClient;
