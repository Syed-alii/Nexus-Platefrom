const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getAllInvestors,
  getAllEntrepreneurs,
  getProfileById,
  getMyProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

// Personal Profile Routes
router.get('/me', protect, getMyProfile);

// Discovery Routes
router.get('/investors', protect, getAllInvestors);
router.get('/entrepreneurs', protect, getAllEntrepreneurs);

// Individual Profile Route
router.get('/:id', protect, getProfileById);

// Legacy/Base Routes
router.route('/')
  .get(protect, checkRole(['investor', 'entrepreneur']), getProfile)
  .put(protect, checkRole(['investor', 'entrepreneur']), updateProfile);

router.post('/upload', protect, uploadProfile.single('image'), uploadProfileImage);

module.exports = router;
