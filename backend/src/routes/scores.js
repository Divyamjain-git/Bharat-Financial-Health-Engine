const express = require('express');
const router = express.Router();
const { getLatestScore, getScoreHistory } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');

router.get('/latest', protect, getLatestScore);
router.get('/history', protect, getScoreHistory);

module.exports = router;
