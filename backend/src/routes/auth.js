const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
