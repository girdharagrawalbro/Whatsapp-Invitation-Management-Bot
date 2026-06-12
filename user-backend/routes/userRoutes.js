const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDelete,
  signup,
  login,
  getMe,
  logout
} = require('../controllers/userController');
const authMiddleware = require('../helpers/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/bulk-delete', bulkDelete);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
