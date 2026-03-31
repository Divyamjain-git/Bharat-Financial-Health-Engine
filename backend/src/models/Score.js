/**
 * Score Model
 * Stores financial health score history for trend analysis
 */

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Overall Score ──────────────────────────────────────────────────────────
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    required: true
  },

  // ── Component Scores (0–100 each, before weighting) ───────────────────────
  components: {
    dtiScore: { type: Number, default: 0 },        // Debt-to-Income Ratio
    savingsScore: { type: Number, default: 0 },    // Savings Rate
    emergencyScore: { type: Number, default: 0 },  // Emergency Fund Coverage
    creditScore: { type: Number, default: 0 },     // Credit Utilization
    expenseScore: { type: Number, default: 0 }     // Essential Expense Ratio
  },

  // ── Raw Metrics ────────────────────────────────────────────────────────────
  metrics: {
    monthlyIncome: { type: Number, default: 0 },
    totalMonthlyEMI: { type: Number, default: 0 },
    totalMonthlyExpenses: { type: Number, default: 0 },
    savingsRate: { type: Number, default: 0 },        // percentage
    dtiRatio: { type: Number, default: 0 },           // percentage
    creditUtilization: { type: Number, default: 0 },  // percentage
    emergencyFundMonths: { type: Number, default: 0 } // months covered
  }

}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
scoreSchema.index({ userId: 1, createdAt: -1 }); // For trend queries
scoreSchema.index({ userId: 1 });

module.exports = mongoose.model('Score', scoreSchema);
