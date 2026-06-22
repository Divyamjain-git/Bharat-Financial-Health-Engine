const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendations, chat } = require('../controllers/aiController');

// Both routes require authentication
router.post('/recommendations', protect, getRecommendations);
router.post('/chat', protect, chat);

module.exports = router;
