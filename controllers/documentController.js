const Document = require('../models/Document');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');
const { createNotification } = require('../utils/notificationService');

// @desc    Upload a new document or new version
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, documentGroupId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a title' });
    }

    // Determine file type from original name as Cloudinary URL might not have clean ext
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'doc';
    if (ext === '.pdf') fileType = 'pdf';
    else if (['.jpg', '.jpeg', '.png'].includes(ext)) fileType = 'image';

    let version = 1;
    let groupId = documentGroupId || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (documentGroupId) {
      // Find latest version in this group
      const latestDoc = await Document.findOne({ documentGroupId }).sort({ version: -1 });
      if (latestDoc) {
        version = latestDoc.version + 1;
      }
    }

    const document = await Document.create({
      uploadedBy: req.user.id,
      title,
      description,
      fileUrl: req.file.path, // Cloudinary URL
      fileType,
      version,
      documentGroupId: groupId,
      status: 'uploaded',
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Optional: Delete from Cloudinary
    // We would need the public_id which we aren't storing yet, 
    // but Cloudinary path usually contains it. 
    // For now, we focus on clearing the DB record.

    await document.deleteOne();
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sign document
// @route   PATCH /api/documents/:id/sign
// @access  Private
const signDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.status === 'signed') {
      return res.status(400).json({ message: 'Document is already signed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a signature image' });
    }

    document.signatureUrl = req.file.path; // Cloudinary URL
    document.signedAt = new Date();
    document.signedBy = req.user.id;
    document.status = 'signed';

    await document.save();

    // Notify uploader
    await createNotification({
      recipient: document.uploadedBy,
      sender: req.user.id,
      type: 'document_signed',
      title: 'Document Signed',
      message: `${req.user.name} has signed the document: ${document.title}`,
      relatedId: document._id,
    });

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  signDocument,
};
