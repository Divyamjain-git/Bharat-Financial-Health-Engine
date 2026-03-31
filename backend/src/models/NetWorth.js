/**
 * NetWorth Model — Assets & Liabilities Snapshot
 */
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['cash_savings', 'fixed_deposit', 'mutual_funds', 'stocks', 'ppf_epf', 'real_estate', 'gold', 'crypto', 'nps', 'other'],
    required: true
  },
  currentValue: { type: Number, required: true, min: 0 },
  purchaseValue: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { _id: true });

const liabilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['home_loan', 'vehicle_loan', 'personal_loan', 'education_loan', 'credit_card', 'business_loan', 'other'],
    required: true
  },
  outstandingAmount: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { _id: true });

const netWorthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assets: { type: [assetSchema], default: [] },
  liabilities: { type: [liabilitySchema], default: [] },
  // Snapshot for history
  snapshots: [{
    totalAssets: Number,
    totalLiabilities: Number,
    netWorth: Number,
    recordedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

netWorthSchema.index({ userId: 1 });

// Virtuals
netWorthSchema.virtual('totalAssets').get(function () {
  return this.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
});
netWorthSchema.virtual('totalLiabilities').get(function () {
  return this.liabilities.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
});
netWorthSchema.virtual('netWorth').get(function () {
  return this.totalAssets - this.totalLiabilities;
});

netWorthSchema.set('toJSON', { virtuals: true });
netWorthSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('NetWorth', netWorthSchema);
