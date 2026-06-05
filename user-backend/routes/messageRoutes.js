const express = require('express');
const router = express.Router();
const {
  getScheduledMessages,
  updateMessageVisibility,
  runCronJob,
  sendMessage,
  getMessageStatus,
  cancelMessage
} = require('../controllers/messageController');
const authMiddleware = require('../helpers/authMiddleware');

router.use(authMiddleware);

router.post('/send', sendMessage);

router.get('/scheduled-messages', getScheduledMessages);
router.post('/scheduled-messages/visibility', updateMessageVisibility);
router.get('/cron-job', runCronJob);

router.get('/:id/status', getMessageStatus);
router.post('/:id/cancel', cancelMessage);

module.exports = router;
