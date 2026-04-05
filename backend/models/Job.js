const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  companyLogo: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'],
    default: 'Full-time',
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
  },
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    enum: ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'],
    default: 'Entry',
  },
  education: {
    type: String,
    default: '',
  },
  responsibilities: [{
    type: String,
  }],
  requirements: [{
    type: String,
  }],
  benefits: [{
    type: String,
  }],
  deadline: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Text index for search
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
