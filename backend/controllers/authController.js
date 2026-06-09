const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role,
      emailVerificationToken: verificationToken,
    });

    if (user) {
      // PHASE 2 FIX: Automatically create Profile record
      await Profile.create({
        userId: user._id,
        fullName: name,
        // Other fields initialized to defaults in schema
      });

      // Send mock verification email
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message: `Please verify your email using this token: ${verificationToken}`,
      });

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user) {
      const isMatch = await user.matchPassword(password);
      console.log(`[DEBUG] Login attempt for: ${email}. User found: ${!!user}. Password match: ${isMatch}`);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = otp;
        user.twoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        await sendEmail({
          email: user.email,
          subject: 'Your 2FA Code',
          message: `Your login code is: ${otp}`,
        });

        return res.status(200).json({
          twoFactorRequired: true,
          userId: user._id,
          message: '2FA code sent to email'
        });
      }

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Verify 2FA Code
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res) => {
  const { userId, code } = req.body;
  try {
    const user = await User.findById(userId).select('+password');
    if (!user || user.twoFactorCode !== code || user.twoFactorExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired 2FA code' });
    }

    // Clear code
    user.twoFactorCode = undefined;
    user.twoFactorExpire = undefined;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Generic response to prevent email enumeration
    const genericSuccess = { message: 'If an account exists for this email, a reset link has been sent.' };

    if (!user) {
      console.log(`[SECURITY] Forgot password attempt for non-existent email: ${email}`);
      return res.status(200).json(genericSuccess);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Hello,\n\nYou requested a password reset.\n\nClick the link below:\n\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password',
        message,
      });

      res.status(200).json(genericSuccess);
    } catch (error) {
      console.error('Email could not be sent', error);
      // Clean up reset token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during forgot-password', error: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  const { password } = req.body;
  console.log('[DEBUG] Reset Password Hit for token:', req.params.resettoken);

  // Password strength validation
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Get hashed token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  
  console.log('[DEBUG] Searching for hashed token:', passwordResetToken);

  try {
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('[DEBUG] Token NOT found or EXPIRED in DB');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log('[DEBUG] User found for reset:', user.email);

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log('[DEBUG] Password reset SUCCESS for:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during reset-password', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  verify2FA,
  forgotPassword,
  resetPassword,
};
