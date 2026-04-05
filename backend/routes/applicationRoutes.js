const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getRecruiterAnalytics,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResume } = require('../config/cloudinary');

router.post('/apply/:jobId', protect, authorize('jobseeker'), uploadResume.single('resume'), applyToJob);
router.get('/my-applications', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/analytics', protect, authorize('recruiter'), getRecruiterAnalytics);
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);

module.exports = router;
