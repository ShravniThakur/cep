const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  headline: {
    type: String,
    default: '',
    maxlength: [200, 'Headline cannot exceed 200 characters'],
  },
  bio: {
    type: String,
    default: '',
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    startYear: Number,
    endYear: Number,
    grade: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    url: String,
  }],
  resume: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    name: { type: String, default: '' },
    uploadedAt: Date,
  },
  // Recruiter-specific fields
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companySize: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  industry: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
