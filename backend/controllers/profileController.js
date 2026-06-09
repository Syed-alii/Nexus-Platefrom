const Profile = require('../models/Profile');
const User = require('../models/User');

// Helper to flatten user + profile
const flattenProfile = (user, profile) => {
  if (!user) return null;
  const p = profile || {};
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: p.profileImage || p.profilePicture || '',
    bio: p.bio || '',
    location: p.location || '',
    
    // Investor Fields
    investmentInterests: p.investmentInterests || [],
    investmentStage: p.investmentStage || [],
    minimumInvestment: p.minimumInvestment || '',
    maximumInvestment: p.maximumInvestment || '',
    totalInvestments: p.totalInvestments || 0,
    portfolioCompanies: p.portfolioCompanies || [],
    
    // Entrepreneur Fields
    startupName: p.startupName || '',
    industry: p.industry || '',
    pitchSummary: p.pitchSummary || '',
    fundingNeeded: p.fundingNeeded || '',
    fundingStage: p.fundingStage || '',
    foundedYear: p.foundedYear || new Date().getFullYear(),
    teamSize: p.teamSize || 1,

    createdAt: user.createdAt,
  };
};

// @desc    Get all investors
// @route   GET /api/profile/investors
// @access  Private
const getAllInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' }).select('-password');
    const profiles = await Profile.find({ userId: { $in: investors.map(i => i._id) } });
    
    const results = investors.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return flattenProfile(user, profile);
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all entrepreneurs
// @route   GET /api/profile/entrepreneurs
// @access  Private
const getAllEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' }).select('-password');
    const profiles = await Profile.find({ userId: { $in: entrepreneurs.map(e => e._id) } });
    
    const results = entrepreneurs.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return flattenProfile(user, profile);
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile by ID
// @route   GET /api/profile/:id
// @access  Private
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ userId: req.params.id });
    res.status(200).json(flattenProfile(user, profile));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      // Return empty profile object instead of error for new users
      return res.status(200).json({ profile: { userId: req.user.id } });
    }
    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const profileFields = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.status(200).json({ message: 'Profile updated', profile });
    }

    // Create if not found
    profileFields.userId = req.user.id;
    profile = await Profile.create(profileFields);
    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile image
// @route   POST /api/profile/upload
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        profileImage: req.file.path,
      });
    } else {
      profile.profileImage = req.file.path;
      await profile.save();
    }

    res.status(200).json({
      message: 'Profile picture updated',
      profileImage: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile (Personal Portfolio)
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(flattenProfile(user, profile));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getAllInvestors,
  getAllEntrepreneurs,
  getProfileById,
  getMyProfile
};
