const express = require('express');
const router = express.Router();
const { getLoans, addLoan, updateLoan, deleteLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', protect, getLoans);
router.post('/', protect, validate('loan'), addLoan);
router.put('/:id', protect, validate('loan'), updateLoan);
router.delete('/:id', protect, deleteLoan);

module.exports = router;
