/**
 * Loan Model
 * Tracks all loans for a user (personal, home, vehicle, business, etc.)
 */

const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['personal', 'home', 'vehicle', 'education', 'business', 'gold', 'other'],
    required: [true, 'Loan type is required']
  },
  lenderName: {
    type: String,
    default: 'Bank/NBFC',
    trim: true
  },
  principalAmount: {
    type: Number,
    required: [true, 'Principal amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  outstandingBalance: {
    type: Number,
    required: [true, 'Outstanding balance is required'],
    min: [0, 'Balance cannot be negative']
  },
  monthlyEMI: {
    type: Number,
    required: [true, 'Monthly EMI is required'],
    min: [0, 'EMI cannot be negative']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate seems too high']
  },
  remainingMonths: {
    type: Number,
    default: null,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
loanSchema.index({ userId: 1 });
loanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Loan', loanSchema);
