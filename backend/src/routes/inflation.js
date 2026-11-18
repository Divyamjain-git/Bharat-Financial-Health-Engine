const express = require('express');
const r = express.Router();
const c = require('../controllers/inflationController');
const { protect } = require('../middleware/auth');

// Public endpoint (no auth needed for rate display)
r.get('/rate', c.getRate);

// Protected endpoints
r.post('/goal-planner', protect, c.goalPlanner);
r.post('/emergency-fund', protect, c.emergencyFundErosion);
r.post('/simulate', protect, c.inflationSimulate);

// Manual refresh — force re-fetch from APIs (admin/debug use)
r.post('/refresh', protect, c.refreshData);

module.exports = r;
