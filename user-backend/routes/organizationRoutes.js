const express = require('express');
const router = express.Router();
const { signup, login, getMe, logout } = require('../controllers/userController');
const authMiddleware = require('../helpers/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
