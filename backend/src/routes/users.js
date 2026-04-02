const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const prisma = require('../config/database');

// GET current user profile
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

// UPDATE user profile (name, phone)
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, isOnboardingComplete: true,
        lastLogin: true, createdAt: true, updatedAt: true
      }
    });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
});

module.exports = router;