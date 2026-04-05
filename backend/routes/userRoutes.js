const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getPlatformStats,
  toggleBookmark,
  getBookmarks,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getPlatformStats);
router.get('/bookmarks', protect, authorize('jobseeker'), getBookmarks);
router.put('/bookmark/:jobId', protect, authorize('jobseeker'), toggleBookmark);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
