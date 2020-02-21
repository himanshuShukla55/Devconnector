const mongoose = require('mongoose');

const { Schema } = mongoose;

const ExperienceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  from: {
    type: Date,
    required: true
  },
  to: Date,
  current: {
    type: Boolean,
    default: false
  },
  description: String
});

const EducationSchema = new Schema({
  school: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: Date,
  current: {
    type: Boolean,
    default: false
  },
  description: String
});

const SocialSchema = new Schema({
  twitter: String,
  facebook: String,
  linkedin: String,
  youtube: String,
  instagram: String
});

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  company: String,
  location: String,
  website: String,
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  bio: String,
  githubusername: String,
  experience: {
    type: [ExperienceSchema]
  },
  education: [EducationSchema],
  social: SocialSchema,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
