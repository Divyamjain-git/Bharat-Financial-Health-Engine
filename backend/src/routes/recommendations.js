const express = require('express');
const router = express.Router();
const { getRecommendations, markRead, dismiss } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRecommendations);
router.patch('/:id/read', protect, markRead);
router.patch('/:id/dismiss', protect, dismiss);

module.exports = router;
