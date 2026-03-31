/**
 * Budget Model — 50/30/20 Rule Budget Planner
 */
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyIncome: { type: Number, required: true },
  // 50-30-20 allocations (percentages, customizable)
  needsPercent: { type: Number, default: 50, min: 0, max: 100 },
  wantsPercent: { type: Number, default: 30, min: 0, max: 100 },
  savingsPercent: { type: Number, default: 20, min: 0, max: 100 },
  // Actual spending categories
  needs: {
    houseRent: { budgeted: Number, actual: Number },
    groceries: { budgeted: Number, actual: Number },
    utilities: { budgeted: Number, actual: Number },
    transport: { budgeted: Number, actual: Number },
    insurance: { budgeted: Number, actual: Number },
    medicalExpenses: { budgeted: Number, actual: Number },
    loanEMIs: { budgeted: Number, actual: Number }
  },
  wants: {
    dining: { budgeted: Number, actual: Number },
    entertainment: { budgeted: Number, actual: Number },
    shopping: { budgeted: Number, actual: Number },
    subscriptions: { budgeted: Number, actual: Number },
    travel: { budgeted: Number, actual: Number }
  },
  savings: {
    emergencyFund: { budgeted: Number, actual: Number },
    investments: { budgeted: Number, actual: Number },
    goalSavings: { budgeted: Number, actual: Number }
  },
  month: { type: String } // e.g. "2024-01"
}, { timestamps: true });

budgetSchema.index({ userId: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
