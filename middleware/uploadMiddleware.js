const multer = require('multer');
const { documentStorage, signatureStorage, profileStorage } = require('../config/cloudinary');

// Init uploads with Cloudinary
const upload = multer({
  storage: documentStorage,
  limits: { fileSize: 10000000 }, // Increase to 10MB for cloud
});

const uploadSignature = multer({
  storage: signatureStorage,
  limits: { fileSize: 2000000 }, // 2MB
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2000000 }, // 2MB
});

module.exports = { upload, uploadSignature, uploadProfile };
