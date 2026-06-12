const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'doc'],
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['uploaded', 'reviewed', 'signed'],
      default: 'uploaded',
    },
    // Used to link different versions of the same document
    documentGroupId: {
      type: String,
      required: true,
    },
    signatureUrl: {
      type: String,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
