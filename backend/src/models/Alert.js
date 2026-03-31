/**
 * Alert Model — Smart Financial Alerts
 */
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'score_drop', 'score_improve', 'high_dti', 'low_savings',
      'credit_danger', 'emergency_fund_low', 'goal_milestone',
      'goal_deadline', 'budget_overspend', 'net_worth_milestone',
      'loan_high_interest', 'simulation_insight'
    ],
    required: true
  },
  severity: { type: String, enum: ['critical', 'warning', 'info', 'success'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionLabel: { type: String, default: null },
  actionRoute: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false }
}, { timestamps: true });

alertSchema.index({ userId: 1, isRead: 1, isDismissed: 1 });

module.exports = mongoose.model('Alert', alertSchema);
