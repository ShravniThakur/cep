const Profile = require('../models/Profile');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role avatar');

    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile by user ID
// @route   GET /api/profile/:userId
// @access  Public
const getProfileByUserId = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email role avatar');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/profile/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Parse JSON arrays if sent as strings
    const arrayFields = ['skills', 'experience', 'education', 'certifications'];
    arrayFields.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try { updateData[field] = JSON.parse(updateData[field]); } catch (e) {}
      }
    });

    let profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email role avatar');

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   PUT /api/profile/resume
// @access  Private (jobseeker)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file' });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    // Delete old resume if exists
    if (profile.resume?.publicId) {
      await cloudinary.uploader.destroy(profile.resume.publicId, { resource_type: 'raw' });
    }

    profile.resume = {
      url: req.file.path,
      publicId: req.file.filename,
      name: req.file.originalname,
      uploadedAt: new Date(),
    };

    await profile.save();

    res.json({ success: true, resume: profile.resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   PUT /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, getProfileByUserId, updateProfile, uploadResume, uploadAvatar };
