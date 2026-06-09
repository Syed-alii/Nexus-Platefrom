const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Common Fields
    fullName: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    
    // Investor Specific Fields
    investmentInterests: {
      type: [String],
      default: []
    },
    investmentStage: {
      type: [String],
      default: []
    },
    minimumInvestment: {
      type: String,
      default: ''
    },
    maximumInvestment: {
      type: String,
      default: ''
    },
    totalInvestments: {
      type: Number,
      default: 0
    },
    portfolioCompanies: {
      type: [String],
      default: []
    },
    
    // Entrepreneur Specific Fields
    startupName: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: ''
    },
    pitchSummary: {
      type: String,
      default: ''
    },
    fundingNeeded: {
      type: String,
      default: ''
    },
    fundingStage: {
      type: String,
      default: ''
    },
    foundedYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    teamSize: {
      type: Number,
      default: 1
    },

    // Legacy/Internal compatibility
    profilePicture: {
      type: String,
      default: '',
    },
    preferences: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
