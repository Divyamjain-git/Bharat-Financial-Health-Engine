/**
 * Goal Model — Financial Goal Tracking
 */
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  achievedAt: { type: Date, default: null }
}, { _id: true });

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  category: {
    type: String,
    enum: ['emergency_fund', 'home_purchase', 'vehicle', 'education', 'retirement', 'vacation', 'wedding', 'business', 'investment', 'debt_freedom', 'custom'],
    required: true
  },
  icon: { type: String, default: '🎯' },
  targetAmount: { type: Number, required: true, min: 0 },
  currentAmount: { type: Number, default: 0, min: 0 },
  monthlyContribution: { type: Number, default: 0, min: 0 },
  targetDate: { type: Date, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['active', 'achieved', 'paused', 'cancelled'], default: 'active' },
  notes: { type: String, default: '', maxlength: 500 },
  milestones: { type: [milestoneSchema], default: [] },
  achievedAt: { type: Date, default: null }
}, { timestamps: true });

goalSchema.index({ userId: 1, status: 1 });

// Virtual: progress percentage
goalSchema.virtual('progressPercent').get(function () {
  if (this.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Virtual: months remaining
goalSchema.virtual('monthsRemaining').get(function () {
  const now = new Date();
  const diff = this.targetDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
});

// Virtual: required monthly saving to hit goal
goalSchema.virtual('requiredMonthlySaving').get(function () {
  const months = this.monthsRemaining;
  if (months <= 0) return 0;
  const remaining = this.targetAmount - this.currentAmount;
  return Math.max(0, Math.ceil(remaining / months));
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
