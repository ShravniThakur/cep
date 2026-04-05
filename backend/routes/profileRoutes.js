const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  getProfileByUserId,
  updateProfile,
  uploadResume,
  uploadAvatar,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResume: resumeUploader, uploadAvatar: avatarUploader } = require('../config/cloudinary');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);
router.put('/resume', protect, authorize('jobseeker'), resumeUploader.single('resume'), uploadResume);
router.put('/avatar', protect, avatarUploader.single('avatar'), uploadAvatar);
router.get('/:userId', getProfileByUserId);

module.exports = router;
