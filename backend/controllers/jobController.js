const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs with search, filter, pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search, location, jobType, experience, salaryMin, salaryMax,
      skills, page = 1, limit = 10, sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (experience) query.experience = experience;
    if (salaryMin) query['salary.min'] = { $gte: Number(salaryMin) };
    if (salaryMax) query['salary.max'] = { $lte: Number(salaryMax) };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email avatar');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Increment views
    job.views += 1;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (recruiter)
const createJob = async (req, res, next) => {
  try {
    const {
      title, description, company, location, jobType, salary,
      skills, experience, education, responsibilities, requirements, benefits, deadline,
    } = req.body;

    if (!title || !description || !company || !location) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const job = await Job.create({
      title, description, company, location, jobType,
      salary: salary ? JSON.parse(salary) : { min: 0, max: 0, currency: 'USD', period: 'yearly' },
      skills: skills ? (Array.isArray(skills) ? skills : JSON.parse(skills)) : [],
      experience, education,
      responsibilities: responsibilities ? (Array.isArray(responsibilities) ? responsibilities : JSON.parse(responsibilities)) : [],
      requirements: requirements ? (Array.isArray(requirements) ? requirements : JSON.parse(requirements)) : [],
      benefits: benefits ? (Array.isArray(benefits) ? benefits : JSON.parse(benefits)) : [],
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (recruiter/admin)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    const updateData = { ...req.body };
    if (updateData.salary && typeof updateData.salary === 'string') updateData.salary = JSON.parse(updateData.salary);
    if (updateData.skills && typeof updateData.skills === 'string') updateData.skills = JSON.parse(updateData.skills);
    if (updateData.responsibilities && typeof updateData.responsibilities === 'string') updateData.responsibilities = JSON.parse(updateData.responsibilities);
    if (updateData.requirements && typeof updateData.requirements === 'string') updateData.requirements = JSON.parse(updateData.requirements);
    if (updateData.benefits && typeof updateData.benefits === 'string') updateData.benefits = JSON.parse(updateData.benefits);

    job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter/admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (recruiter)
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
