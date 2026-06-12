const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;
