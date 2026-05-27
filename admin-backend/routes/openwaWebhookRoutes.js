const express = require('express');
const OpenWAWebhookHandler = require('../helpers/openwaWebhook');
const logger = require('../helpers/logger');

const router = express.Router();

// Initialize webhook handler
const webhookHandler = new OpenWAWebhookHandler();

/**
 * POST /api/openwa/webhook
 * Receives events from OpenWA server
 * 
 * Expected body:
 * {
 *   "eventType": "message.received|message.status|session.status|group.event",
 *   "data": { ... event-specific data ... },
 *   "signature": "hmac-sha256-signature"
 * }
 */
router.post('/webhook', async (req, res) => {
  try {
    const { body } = req;
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];

    if (!body || !body.eventType) {
      return res.status(400).json({ 
        error: 'Invalid webhook payload',
        message: 'eventType is required'
      });
    }

    logger.info(`📨 [Webhook] Received ${body.eventType} event`);

    // Handle the webhook
    const result = await webhookHandler.handleWebhook(body, signature);

    res.json({
      success: true,
      eventType: body.eventType,
      result
    });

  } catch (error) {
    logger.error(`❌ [Webhook] Error: ${error.message}`);
    
    res.status(400).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * GET /api/openwa/webhook/status
 * Health check for webhook endpoint
 */
router.get('/webhook/status', (req, res) => {
  res.json({
    status: 'active',
    message: 'OpenWA webhook receiver is running',
    timestamp: new Date()
  });
});

/**
 * POST /api/openwa/webhook/test
 * Test webhook (for development)
 */
router.post('/webhook/test', async (req, res) => {
  try {
    const testPayload = {
      eventType: 'message.received',
      data: {
        from: '919876543210@c.us',
        body: 'Test message',
        timestamp: new Date(),
        messageId: 'test_' + Date.now(),
        isGroup: false
      }
    };

    logger.info('🧪 [Webhook] Test payload received');

    const result = await webhookHandler.handleWebhook(testPayload, '');

    res.json({
      success: true,
      message: 'Test webhook processed',
      result
    });

  } catch (error) {
    logger.error(`❌ [Webhook Test] Error: ${error.message}`);
    res.status(500).json({
      error: 'Test webhook failed',
      message: error.message
    });
  }
});

module.exports = router;
