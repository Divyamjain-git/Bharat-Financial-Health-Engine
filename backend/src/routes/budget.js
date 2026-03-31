const express = require('express');
const r = express.Router();
const c = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
r.get('/', protect, c.getBudget);
r.put('/', protect, c.updateBudget);
module.exports = r;
