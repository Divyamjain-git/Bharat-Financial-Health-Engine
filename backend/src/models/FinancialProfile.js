/**
 * Financial Profile Model
 * Stores all financial data for both salaried and business users
 */

const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const creditCardSchema = new mongoose.Schema({
  cardName: { type: String, default: 'Credit Card' },
  creditLimit: { type: Number, required: true, min: 0 },
  outstandingBalance: { type: Number, required: true, min: 0 }
}, { _id: true });

const householdExpensesSchema = new mongoose.Schema({
  houseRent: { type: Number, default: 0, min: 0 },
  groceries: { type: Number, default: 0, min: 0 },
  electricityBill: { type: Number, default: 0, min: 0 },
  gasBill: { type: Number, default: 0, min: 0 },
  waterBill: { type: Number, default: 0, min: 0 },
  internetMobile: { type: Number, default: 0, min: 0 },
  medicalExpenses: { type: Number, default: 0, min: 0 },
  vehicleFuel: { type: Number, default: 0, min: 0 },
  schoolFees: { type: Number, default: 0, min: 0 },
  otherExpenses: { type: Number, default: 0, min: 0 }
}, { _id: false });

// ─── Main Schema ──────────────────────────────────────────────────────────────

const financialProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One profile per user
  },

  // ── Salaried Income ────────────────────────────────────────────────────────
  netMonthlySalary: { type: Number, default: 0, min: 0 },
  annualBonus: { type: Number, default: 0, min: 0 },
  otherMonthlyIncome: { type: Number, default: 0, min: 0 },

  // ── Business Income ────────────────────────────────────────────────────────
  last12MonthRevenue: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) { return arr.length <= 12; },
      message: 'Revenue array cannot exceed 12 months'
    }
  },
  avgMonthlyProfit: { type: Number, default: 0, min: 0 },

  // ── Household Expenses (common to both) ───────────────────────────────────
  expenses: {
    type: householdExpensesSchema,
    default: () => ({})
  },

  // ── Emergency Fund ─────────────────────────────────────────────────────────
  emergencyFundAmount: { type: Number, default: 0, min: 0 },

  // ── Credit Cards ──────────────────────────────────────────────────────────
  creditCards: {
    type: [creditCardSchema],
    default: []
  },

  // ── Savings / Investments ──────────────────────────────────────────────────
  monthlySavings: { type: Number, default: 0, min: 0 },

  // ── Last updated flag ──────────────────────────────────────────────────────
  lastScoreCalculatedAt: { type: Date, default: null }

}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
financialProfileSchema.index({ userId: 1 });

// ─── Virtual: Total monthly income ────────────────────────────────────────────
financialProfileSchema.virtual('totalMonthlyIncome').get(function () {
  if (this.netMonthlySalary > 0) {
    return this.netMonthlySalary + (this.annualBonus / 12) + this.otherMonthlyIncome;
  }
  // Business user
  if (this.last12MonthRevenue.length > 0) {
    const avg = this.last12MonthRevenue.reduce((a, b) => a + b, 0) / this.last12MonthRevenue.length;
    return avg;
  }
  return this.avgMonthlyProfit;
});

// ─── Virtual: Total monthly expenses ──────────────────────────────────────────
financialProfileSchema.virtual('totalMonthlyExpenses').get(function () {
  const e = this.expenses;
  if (!e) return 0;
  return (e.houseRent || 0) + (e.groceries || 0) + (e.electricityBill || 0) +
    (e.gasBill || 0) + (e.waterBill || 0) + (e.internetMobile || 0) +
    (e.medicalExpenses || 0) + (e.vehicleFuel || 0) + (e.schoolFees || 0) +
    (e.otherExpenses || 0);
});

// ─── Virtual: Total credit utilization ────────────────────────────────────────
financialProfileSchema.virtual('creditUtilization').get(function () {
  if (!this.creditCards || this.creditCards.length === 0) return 0;
  const totalLimit = this.creditCards.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalBalance = this.creditCards.reduce((sum, c) => sum + c.outstandingBalance, 0);
  if (totalLimit === 0) return 0;
  return (totalBalance / totalLimit) * 100;
});

financialProfileSchema.set('toJSON', { virtuals: true });
financialProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
