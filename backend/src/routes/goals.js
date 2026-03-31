const express = require('express');
const r = express.Router();
const c = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// Fix: /meta/suggestions MUST come before /:id routes to avoid Express matching
// "meta" as an :id parameter
r.get('/meta/suggestions', protect, c.getSuggestions);

r.get('/', protect, c.getGoals);
r.post('/', protect, c.createGoal);
r.put('/:id', protect, c.updateGoal);
r.delete('/:id', protect, c.deleteGoal);
r.get('/:id/analyze', protect, c.analyzeGoal);

module.exports = r;
