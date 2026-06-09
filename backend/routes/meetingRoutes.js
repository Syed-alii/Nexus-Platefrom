const express = require('express');
const router = express.Router();
const {
  scheduleMeeting,
  getMeetings,
  getMeetingById,
  acceptMeeting,
  rejectMeeting
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting scheduling and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       required:
 *         - participantEmail
 *         - title
 *         - startTime
 *         - endTime
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         participantEmail:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled]
 */

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Schedule a new meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meeting'
 *     responses:
 *       201:
 *         description: Meeting scheduled
 *   get:
 *     summary: Get all user meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meetings
 */
router.route('/')
  .post(protect, scheduleMeeting)
  .get(protect, getMeetings);

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: Get meeting details by ID
 *     tags: [Meetings]
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
 *         description: Meeting details
 */
router.route('/:id')
  .get(protect, getMeetingById);

/**
 * @swagger
 * /api/meetings/{id}/accept:
 *   patch:
 *     summary: Accept a meeting invitation
 *     tags: [Meetings]
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
 *         description: Meeting accepted
 */
router.patch('/:id/accept', protect, acceptMeeting);

/**
 * @swagger
 * /api/meetings/{id}/reject:
 *   patch:
 *     summary: Reject a meeting invitation
 *     tags: [Meetings]
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
 *         description: Meeting rejected
 */
router.patch('/:id/reject', protect, rejectMeeting);

module.exports = router;
