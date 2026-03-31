const express = require('express');
const r = express.Router();
const c = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');
r.get('/templates', protect, c.getTemplates);
r.post('/run', protect, c.simulate);
r.get('/insights', protect, c.getScoreInsights);
r.get('/peer-comparison', protect, c.getPeerComparison);
module.exports = r;
