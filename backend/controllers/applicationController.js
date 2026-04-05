const Application = require('../models/Application');
const Job = require('../models/Job');
const { uploadResume } = require('../config/cloudinary');

// @desc    Apply to a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (jobseeker)
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ success: false, message: 'Job is no longer active' });

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this job' });

    const resumeData = req.file
      ? { url: req.file.path, publicId: req.file.filename, name: req.file.originalname }
      : {};

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      recruiter: job.postedBy,
      coverLetter,
      resume: resumeData,
    });

    // Increment application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    await application.populate('job', 'title company location');
    await application.populate('applicant', 'name email avatar');

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's applications
// @route   GET /api/applications/my-applications
// @access  Private (jobseeker)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location jobType salary isActive')
      .sort('-appliedAt');

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a job (recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruiter)
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email avatar')
      .populate('job', 'title company')
      .sort('-appliedAt');

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;
    await application.save();

    await application.populate('applicant', 'name email');
    await application.populate('job', 'title company');

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's analytics data
// @route   GET /api/applications/analytics
// @access  Private (recruiter)
const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.isActive).length;

    const allApplications = await Application.find({ recruiter: req.user._id });
    const totalApplications = allApplications.length;

    const statusBreakdown = {
      pending: allApplications.filter(a => a.status === 'pending').length,
      reviewed: allApplications.filter(a => a.status === 'reviewed').length,
      shortlisted: allApplications.filter(a => a.status === 'shortlisted').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
    };

    // Applications per job
    const appsPerJob = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return { jobTitle: job.title, count, jobId: job._id };
      })
    );

    // Monthly applications (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Application.aggregate([
      { $match: { recruiter: req.user._id, appliedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$appliedAt' }, year: { $year: '$appliedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalJobs,
        activeJobs,
        totalApplications,
        statusBreakdown,
        appsPerJob,
        monthlyData,
        totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (jobseeker)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await application.deleteOne();
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getRecruiterAnalytics,
  withdrawApplication,
};
