const express = require('express');
const router = express.Router();
const { getSessionManager } = require('../helpers/openwaSessionManager');
const authMiddleware = require('../helpers/authMiddleware');
const logger = require('../helpers/logger');

async function resolveOrgSession(manager, orgId) {
  const sessionName = `Org-${orgId}`;
  let sessionId = await manager.findSessionIdByName(sessionName);

  if (!sessionId) {
    try {
      const created = await manager.createSession(sessionName);
      sessionId = created.sessionId || created.id || null;
    } catch (error) {
      // If the session already exists remotely, try resolving it again by name.
      sessionId = await manager.findSessionIdByName(sessionName);
      if (!sessionId) {
        throw error;
      }
    }
  }

  if (!sessionId) {
    throw new Error(`OpenWA session not found for ${sessionName}`);
  }

  return { sessionId, sessionName };
}

// Protect all session routes
router.use(authMiddleware);

/**
 * GET /api/openwa-session/status
 * Get the current WhatsApp connection status of the organization's session
 */
router.get('/status', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized: No organization session found' });
    }

    const manager = getSessionManager();
    const { sessionId } = await resolveOrgSession(manager, orgId);
    const status = await manager.checkStatus(sessionId);

    res.json(status);
  } catch (error) {
    logger.error(`Error checking OpenWA status: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/openwa-session/start
 * Initialize or resume the WhatsApp session for this organization
 */
router.post('/start', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const manager = getSessionManager();
    const { sessionId, sessionName } = await resolveOrgSession(manager, orgId);

    // Start session on OpenWA server (triggers QR generation or auto-reconnect)
    const result = await manager.startSession(sessionId);
    res.json({ ...result, sessionName });
  } catch (error) {
    logger.error(`Error starting OpenWA session: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/openwa-session/qr
 * Fetch the base64 QR code image to authenticate the session
 */
router.get('/qr', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const manager = getSessionManager();
    const { sessionId } = await resolveOrgSession(manager, orgId);
        const qrData = await manager.getQRCode(sessionId);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({
      ...qrData,
      qr: qrData.qr || qrData.qrCode,
    });
  } catch (error) {
    logger.error(`Error fetching OpenWA QR code: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/openwa-session/logout
 * Disconnect/logout and terminate the WhatsApp session
 */
router.post('/logout', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const manager = getSessionManager();
    const { sessionId } = await resolveOrgSession(manager, orgId);
    const result = await manager.logoutSession(sessionId);

    res.json(result);
  } catch (error) {
    logger.error(`Error logging out OpenWA session: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/openwa-session/webhook/register
 * Force-register or refresh the webhook listener on the OpenWA server
 */
router.post('/webhook/register', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const manager = getSessionManager();
    const { sessionId } = await resolveOrgSession(manager, orgId);
    
    // Auto-generate absolute URL for our webhook endpoint
    const webhookUrl = process.env.OPENWA_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/openwa/webhook`;
    const events = ['message.received', 'message.ack', 'session.status'];
    const secret = process.env.OPENWA_WEBHOOK_SECRET || '';

    logger.info(`Registering webhook for session ${sessionId} to ${webhookUrl}`);
    const result = await manager.registerWebhook(sessionId, webhookUrl, events, secret);
    
    res.json(result);
  } catch (error) {
    logger.error(`Error registering OpenWA webhook: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
