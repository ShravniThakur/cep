const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip(skip).limit(Number(limit));

    res.json({ success: true, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });

    await user.deleteOne();
    await Profile.deleteOne({ user: req.params.id });
    await Application.deleteMany({ $or: [{ applicant: req.params.id }, { recruiter: req.params.id }] });
    await Job.deleteMany({ postedBy: req.params.id });

    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats (admin)
// @route   GET /api/users/stats
// @access  Private (admin)
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();

    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobSeekers,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        recentUsers,
        monthlyRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark / Unbookmark a job
// @route   PUT /api/users/bookmark/:jobId
// @access  Private (jobseeker)
const toggleBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;

    const isBookmarked = user.bookmarkedJobs.includes(jobId);

    if (isBookmarked) {
      user.bookmarkedJobs = user.bookmarkedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.bookmarkedJobs.push(jobId);
    }

    await user.save();

    res.json({
      success: true,
      message: isBookmarked ? 'Job removed from bookmarks' : 'Job bookmarked',
      bookmarked: !isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked jobs
// @route   GET /api/users/bookmarks
// @access  Private (jobseeker)
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarkedJobs',
      populate: { path: 'postedBy', select: 'name' },
    });

    res.json({ success: true, jobs: user.bookmarkedJobs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers, getUserById, toggleUserStatus, deleteUser,
  getPlatformStats, toggleBookmark, getBookmarks,
};
