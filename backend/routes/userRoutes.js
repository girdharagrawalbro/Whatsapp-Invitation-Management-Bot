const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDelete
} = require('../controllers/userController');
const authMiddleware = require('../helpers/authMiddleware');

router.use(authMiddleware);

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/bulk-delete', bulkDelete);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
