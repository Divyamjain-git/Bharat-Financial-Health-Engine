const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET current user profile
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

// UPDATE user profile (name, phone)
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
});

module.exports = router;
