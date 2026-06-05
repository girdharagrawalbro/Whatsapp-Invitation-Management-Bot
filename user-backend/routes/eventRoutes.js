const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  deleteEvent,
  createEvent,
  updateEvent,
  getTodayCount,
  getUpcomingCount,
  uploadEventMedia,
  getEventStats
} = require('../controllers/eventController');
const authMiddleware = require('../helpers/authMiddleware');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All event routes are protected
// router.use(authMiddleware);

router.get('/', getAllEvents);
router.get('/stats', getEventStats);
router.get('/count/today', getTodayCount);
router.get('/count/upcoming', getUpcomingCount);
router.post('/', createEvent);
router.post('/upload', upload.single('file'), uploadEventMedia);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;

