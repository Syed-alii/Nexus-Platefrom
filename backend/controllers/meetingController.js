const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const { createNotification } = require('../utils/notificationService');

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private
const scheduleMeeting = async (req, res) => {
  console.log('Meeting request body:', req.body);
  console.log('Meeting request headers:', req.headers);
  console.log('Keys in body:', Object.keys(req.body));
  const { participantEmail, title, description, startTime, endTime } = req.body;

  if (!participantEmail || !title || !startTime || !endTime) {
    console.log('Validation failed: Missing fields', req.body);
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Find user by email (Assuming User is globally available or we need to require it)
  const User = require('../models/User'); 
  const participantUser = await User.findOne({ email: participantEmail });
  if (!participantUser) {
    return res.status(400).json({ message: 'Participant not found' });
  }
  const participant = participantUser._id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(participant)) {
    return res.status(400).json({ message: 'Invalid participant ID' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  try {
    // Conflict Detection
    const conflict = await Meeting.findOne({
      $or: [
        { organizer: req.user.id },
        { participant: req.user.id },
        { organizer: participant },
        { participant: participant }
      ],
      status: { $in: ['pending', 'accepted'] },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({ 
        message: 'Scheduling conflict detected. One of the participants is already booked during this time.',
        conflict: {
          title: conflict.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime
        }
      });
    }

    const meeting = await Meeting.create({
      organizer: req.user.id,
      participant,
      title,
      description,
      startTime: start,
      endTime: end,
    });

    // Notify participant
    await createNotification({
      recipient: participant,
      sender: req.user.id,
      type: 'meeting_request',
      title: 'New Meeting Request',
      message: `${req.user.name} has requested a meeting: ${title}`,
      relatedId: meeting._id,
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Schedule Meeting Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Get all user meetings
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ organizer: req.user.id }, { participant: req.user.id }]
    })
    .populate('organizer', 'name email role')
    .populate('participant', 'name email role')
    .sort({ startTime: 1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('organizer', 'name email role')
      .populate('participant', 'name email role');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check authorization
    if (meeting.organizer._id.toString() !== req.user.id && meeting.participant._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this meeting' });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept meeting
// @route   PATCH /api/meetings/:id/accept
// @access  Private
const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('organizer participant', 'name');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only invited participant can accept
    if (meeting.participant._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the invited participant can accept this meeting' });
    }

    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept a meeting that is already ${meeting.status}` });
    }

    meeting.status = 'accepted';
    await meeting.save();

    // Notify organizer
    await createNotification({
      recipient: meeting.organizer._id,
      sender: req.user.id,
      type: 'meeting_accepted',
      title: 'Meeting Accepted',
      message: `${req.user.name} has accepted your meeting request: ${meeting.title}`,
      relatedId: meeting._id,
    });

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject meeting
// @route   PATCH /api/meetings/:id/reject
// @access  Private
const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only invited participant can reject
    if (meeting.participant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the invited participant can reject this meeting' });
    }

    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a meeting that is already ${meeting.status}` });
    }

    meeting.status = 'rejected';
    await meeting.save();

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  scheduleMeeting,
  getMeetings,
  getMeetingById,
  acceptMeeting,
  rejectMeeting
};
