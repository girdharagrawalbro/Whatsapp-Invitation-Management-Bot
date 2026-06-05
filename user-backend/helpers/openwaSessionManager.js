const OpenWAClient = require('../config/openwa');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

/**
 * OpenWA Session Manager
 * Handles session creation, persistence, monitoring, and lifecycle
 */

class OpenWASessionManager {
  constructor(options = {}) {
    this.sessionDirectory = options.sessionDirectory || path.join(process.cwd(), '.sessions');
    this.sessionConfigFile = path.join(this.sessionDirectory, 'sessions.json');
    this.activeSessions = new Map();
    this.clients = new Map();
    
    // Initialize session directory
    this._ensureSessionDirectory();
    this._loadSessionConfig();
  }

  /**
   * Initialize and return a client for a session
   */
  getClient(sessionId) {
    if (!this.clients.has(sessionId)) {
      const client = new OpenWAClient({ sessionId });
      this.clients.set(sessionId, client);
    }
    return this.clients.get(sessionId);
  }

  /**
   * Resolve a session ID from its configured name.
   * Falls back to a live list call if the ID is not already cached locally.
   */
  async findSessionIdByName(sessionName) {
    for (const session of this.activeSessions.values()) {
      if (session.name === sessionName) {
        return session.id;
      }
    }

    const sessions = await this.listSessions();
    for (const session of sessions) {
      if (session.name === sessionName) {
        return session.id;
      }
    }

    return null;
  }

  /**
   * Create a new session
   */
  async createSession(sessionName) {
    try {
      const client = new OpenWAClient();
      const sessionData = await client.createSession(sessionName);

      const sessionId = sessionData.sessionId || sessionData.id;

      // Store session info
      this.activeSessions.set(sessionId, {
        id: sessionId,
        name: sessionName,
        status: 'created',
        createdAt: new Date(),
        lastStatusCheck: new Date()
      });

      this._saveSessionConfig();

      logger.info(`✓ Session created: ${sessionId} (${sessionName})`);
      return {
        sessionId,
        sessionName,
        status: 'created'
      };

    } catch (error) {
      logger.error(`❌ Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start a session and get QR code
   */
  async startSession(sessionId) {
    try {
      const client = this.getClient(sessionId);
      
      logger.info(`Starting session ${sessionId}...`);
      
      const result = await client.startSession(sessionId);

      // Update session status
      if (this.activeSessions.has(sessionId)) {
        const session = this.activeSessions.get(sessionId);
        session.status = 'started';
        session.lastStatusCheck = new Date();
        this._saveSessionConfig();
      }

      logger.info(`✓ Session started: ${sessionId}`);
      return {
        sessionId,
        status: 'started',
        result
      };

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || '';

      if (error?.response?.status === 400 && errorMessage.includes('already started')) {
        logger.info(`Session ${sessionId} is already started; refreshing status instead of failing.`);

        const currentStatus = await this.checkStatus(sessionId);
        if (this.activeSessions.has(sessionId)) {
          const session = this.activeSessions.get(sessionId);
          session.status = currentStatus.status;
          session.lastStatusCheck = new Date();
          this._saveSessionConfig();
        }

        return {
          sessionId,
          status: currentStatus.status === 'error' ? 'started' : currentStatus.status,
          alreadyStarted: true,
          result: currentStatus,
        };
      }

      logger.error(`❌ Failed to start session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get QR code for a session (base64 or image)
   */
  async getQRCode(sessionId, format = 'base64') {
    try {
      const client = this.getClient(sessionId);
      
      logger.info(`Fetching QR code for ${sessionId}...`);
      
      const qrData = await client.getQRCode(sessionId);

      return {
        sessionId,
        qr: qrData.qr || qrData.qrCode,
        format: format,
        expiresIn: qrData.expiresIn || 30000
      };

    } catch (error) {
      logger.error(`❌ Failed to get QR code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check session status
   */
  async checkStatus(sessionId) {
    try {
      const client = this.getClient(sessionId);
      const status = await client.getSessionStatus(sessionId);

      if (this.activeSessions.has(sessionId)) {
        const session = this.activeSessions.get(sessionId);
        session.status = status.status;
        session.lastStatusCheck = new Date();
      }

      const upperStatus = String(status.status || '').toUpperCase();
      const authenticated = ['AUTHENTICATED', 'CONNECTED', 'READY', 'SYNCED'].includes(upperStatus);

      return {
        sessionId,
        status: status.status,
        authenticated: authenticated,
        lastCheck: new Date()
      };

    } catch (error) {
      logger.error(`❌ Status check failed for ${sessionId}: ${error.message}`);
      return {
        sessionId,
        status: 'error',
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * List all sessions
   */
  async listSessions() {
    try {
      const client = new OpenWAClient();
      const sessions = await client.listSessions();

      // Update local cache
      sessions.forEach(session => {
        if (!this.activeSessions.has(session.id)) {
          this.activeSessions.set(session.id, {
            id: session.id,
            name: session.name,
            status: session.status,
            createdAt: session.createdAt || new Date(),
            lastStatusCheck: new Date()
          });
        }
      });

      this._saveSessionConfig();

      return sessions;

    } catch (error) {
      logger.error(`❌ Failed to list sessions: ${error.message}`);
      return Array.from(this.activeSessions.values());
    }
  }

  /**
   * Logout a session
   */
  async logoutSession(sessionId) {
    try {
      const client = this.getClient(sessionId);
      
      logger.info(`Logging out session ${sessionId}...`);
      
      await client.logoutSession(sessionId);

      // Update status
      if (this.activeSessions.has(sessionId)) {
        const session = this.activeSessions.get(sessionId);
        session.status = 'logged_out';
        session.lastStatusCheck = new Date();
        this._saveSessionConfig();
      }

      logger.info(`✓ Session logged out: ${sessionId}`);
      return {
        sessionId,
        status: 'logged_out'
      };

    } catch (error) {
      logger.error(`❌ Failed to logout session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register webhook for a session
   */
  async registerWebhook(sessionId, webhookUrl, events = [], secret = '') {
    try {
      const client = this.getClient(sessionId);

      logger.info(`Registering webhook for ${sessionId}: ${webhookUrl}`);

      const result = await client.registerWebhook(webhookUrl, events, secret);

      return {
        sessionId,
        webhook: result,
        status: 'registered'
      };

    } catch (error) {
      logger.error(`❌ Failed to register webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Monitor all sessions (called periodically)
   */
  async monitorSessions() {
    try {
      logger.info(`🔍 Monitoring ${this.activeSessions.size} sessions...`);

      const results = [];

      for (const [sessionId] of this.activeSessions) {
        try {
          const status = await this.checkStatus(sessionId);
          results.push(status);

          if (status.authenticated) {
            logger.info(`✅ Session ${sessionId}: AUTHENTICATED`);
          } else {
            logger.warn(`⚠️  Session ${sessionId}: ${status.status}`);
          }
        } catch (error) {
          logger.error(`Monitor error for ${sessionId}: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      logger.error(`❌ Session monitoring failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const client = new OpenWAClient();
      const health = await client.healthCheck();

      return {
        openwaServer: health.status === 'ok' ? 'healthy' : 'unhealthy',
        localSessions: this.activeSessions.size,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`❌ Health check failed: ${error.message}`);
      return {
        openwaServer: 'unhealthy',
        error: error.message,
        localSessions: this.activeSessions.size
      };
    }
  }

  /**
   * Private: Ensure session directory exists
   */
  _ensureSessionDirectory() {
    if (!fs.existsSync(this.sessionDirectory)) {
      fs.mkdirSync(this.sessionDirectory, { recursive: true });
      logger.info(`✓ Session directory created: ${this.sessionDirectory}`);
    }
  }

  /**
   * Private: Load session configuration from file
   */
  _loadSessionConfig() {
    try {
      if (fs.existsSync(this.sessionConfigFile)) {
        const data = fs.readFileSync(this.sessionConfigFile, 'utf8');
        const sessions = JSON.parse(data);

        sessions.forEach(session => {
          this.activeSessions.set(session.id, session);
        });

        logger.info(`✓ Loaded ${sessions.length} sessions from config`);
      }
    } catch (error) {
      logger.warn(`⚠️  Failed to load session config: ${error.message}`);
    }
  }

  /**
   * Private: Save session configuration to file
   */
  _saveSessionConfig() {
    try {
      const sessions = Array.from(this.activeSessions.values());
      fs.writeFileSync(
        this.sessionConfigFile,
        JSON.stringify(sessions, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error(`❌ Failed to save session config: ${error.message}`);
    }
  }
}

// Export singleton
let instance = null;

function getSessionManager(options = {}) {
  if (!instance) {
    instance = new OpenWASessionManager(options);
  }
  return instance;
}

module.exports = {
  OpenWASessionManager,
  getSessionManager
};
