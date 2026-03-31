const express = require('express');
const router = express.Router();
const ac = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/', protect, ac.getAlerts);
router.post('/generate', protect, ac.generateAlerts);
router.patch('/:id/read', protect, ac.markRead);
router.patch('/:id/dismiss', protect, ac.dismiss);

module.exports = router;
