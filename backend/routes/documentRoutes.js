const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  signDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadSignature } = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document processing and e-signature
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - title
 *         - fileUrl
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         fileUrl:
 *           type: string
 *         fileType:
 *           type: string
 *           enum: [pdf, image, doc]
 *         version:
 *           type: number
 *         status:
 *           type: string
 *           enum: [uploaded, reviewed, signed]
 *         signatureUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post('/upload', protect, upload.single('file'), uploadDocument);

/**
 * @swagger
 * /api/documents/{id}/sign:
 *   patch:
 *     summary: Sign a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document signed
 */
router.patch('/:id/sign', protect, uploadSignature.single('file'), signDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all user documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', protect, getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document data
 */
router.get('/:id', protect, getDocumentById);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/:id', protect, deleteDocument);

module.exports = router;
