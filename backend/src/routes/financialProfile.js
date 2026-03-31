const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/financialProfileController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', protect, getProfile);
router.post('/', protect, validate('financialProfile'), createProfile);
router.put('/', protect, validate('financialProfile'), updateProfile);

module.exports = router;
