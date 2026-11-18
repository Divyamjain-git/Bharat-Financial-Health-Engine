const express = require('express');
const router = express.Router();
const { getTaxSummary, calculateTax } = require('../controllers/taxController');
const { protect } = require('../middleware/auth');

// Protected routes (uses user's saved profile)
router.get('/summary', protect, getTaxSummary);
router.post('/calculate', protect, calculateTax);

module.exports = router;
