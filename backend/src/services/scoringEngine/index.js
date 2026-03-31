/**
 * BFHE Scoring Engine
 * Calculates Financial Health Score (0–100) based on multiple financial metrics
 *
 * Weights (Salaried):
 *   DTI Ratio          → 25%
 *   Savings Rate       → 20%
 *   Emergency Fund     → 20%
 *   Credit Utilization → 20%
 *   Expense Ratio      → 15%
 */

const WEIGHTS = {
  dti: 0.25,
  savings: 0.20,
  emergency: 0.20,
  credit: 0.20,
  expense: 0.15
};

const getGrade = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Critical';
};

const clamp = (val) => Math.min(100, Math.max(0, val));

const scoreDTI = (monthlyIncome, totalEMI) => {
  if (monthlyIncome <= 0) return 0;
  const dti = (totalEMI / monthlyIncome) * 100;
  if (dti < 20) return 100;
  if (dti < 35) return Math.round(100 - ((dti - 20) / 15) * 20);
  if (dti < 50) return Math.round(80 - ((dti - 35) / 15) * 30);
  if (dti < 60) return Math.round(50 - ((dti - 50) / 10) * 25);
  return Math.round(Math.max(0, 25 - ((dti - 60) / 20) * 25));
};

/**
 * Score the Savings Rate
 * Fix: consistent linear interpolation across all bands — no gap or jump at 20%.
 *
 * >= 30%  → 100
 * 20–30%  → 80–100
 * 10–20%  → 60–80   (was 60–80, now consistent)
 * 5–10%   → 30–60
 * 0–5%    → 0–30
 * < 0     → 0
 */
const scoreSavings = (monthlyIncome, totalExpenses, totalEMI) => {
  if (monthlyIncome <= 0) return 0;
  const savings = monthlyIncome - totalExpenses - totalEMI;
  const rate = (savings / monthlyIncome) * 100;

  if (rate >= 30) return 100;
  if (rate >= 20) return Math.round(80 + ((rate - 20) / 10) * 20);
  if (rate >= 10) return Math.round(60 + ((rate - 10) / 10) * 20);
  if (rate >= 5)  return Math.round(30 + ((rate - 5)  / 5)  * 30);
  if (rate >= 0)  return Math.round((rate / 5) * 30);
  return 0;
};

const scoreEmergencyFund = (emergencyFund, monthlyExpenses) => {
  if (monthlyExpenses <= 0) return emergencyFund > 0 ? 100 : 50;
  const months = emergencyFund / monthlyExpenses;
  if (months >= 6) return 100;
  if (months >= 4) return Math.round(75 + ((months - 4) / 2) * 25);
  if (months >= 2) return Math.round(50 + ((months - 2) / 2) * 25);
  if (months >= 1) return Math.round(25 + (months - 1) * 25);
  return Math.round(months * 25);
};

const scoreCreditUtilization = (creditCards) => {
  if (!creditCards || creditCards.length === 0) return 80;
  const totalLimit = creditCards.reduce((s, c) => s + (c.creditLimit || 0), 0);
  const totalBalance = creditCards.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
  if (totalLimit === 0) return 80;
  const util = (totalBalance / totalLimit) * 100;
  if (util < 10) return 100;
  if (util < 30) return Math.round(100 - ((util - 10) / 20) * 20);
  if (util < 50) return Math.round(80 - ((util - 30) / 20) * 30);
  if (util < 75) return Math.round(50 - ((util - 50) / 25) * 30);
  return Math.round(Math.max(0, 20 - ((util - 75) / 25) * 20));
};

const scoreExpenseRatio = (monthlyIncome, totalExpenses) => {
  if (monthlyIncome <= 0) return 0;
  const ratio = (totalExpenses / monthlyIncome) * 100;
  if (ratio < 40) return 100;
  if (ratio < 60) return Math.round(100 - ((ratio - 40) / 20) * 30);
  if (ratio < 75) return Math.round(70 - ((ratio - 60) / 15) * 30);
  if (ratio < 90) return Math.round(40 - ((ratio - 75) / 15) * 25);
  return Math.round(Math.max(0, 15 - ((ratio - 90) / 10) * 15));
};

const calculateScore = (profile, loans = []) => {
  let monthlyIncome = 0;
  if (profile.netMonthlySalary > 0) {
    monthlyIncome = profile.netMonthlySalary
      + (profile.annualBonus || 0) / 12
      + (profile.otherMonthlyIncome || 0);
  } else if (profile.last12MonthRevenue && profile.last12MonthRevenue.length > 0) {
    const total = profile.last12MonthRevenue.reduce((a, b) => a + b, 0);
    monthlyIncome = total / profile.last12MonthRevenue.length;
  } else {
    monthlyIncome = profile.avgMonthlyProfit || 0;
  }

  const e = profile.expenses || {};
  const totalMonthlyExpenses =
    (e.houseRent || 0) + (e.groceries || 0) + (e.electricityBill || 0) +
    (e.gasBill || 0) + (e.waterBill || 0) + (e.internetMobile || 0) +
    (e.medicalExpenses || 0) + (e.vehicleFuel || 0) + (e.schoolFees || 0) +
    (e.otherExpenses || 0);

  const totalMonthlyEMI = loans.reduce((sum, loan) => sum + (loan.monthlyEMI || 0), 0);
  const monthlySavings = monthlyIncome - totalMonthlyExpenses - totalMonthlyEMI;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const dtiRatio = monthlyIncome > 0 ? (totalMonthlyEMI / monthlyIncome) * 100 : 0;

  const totalCreditLimit = (profile.creditCards || []).reduce((s, c) => s + (c.creditLimit || 0), 0);
  const totalCreditBalance = (profile.creditCards || []).reduce((s, c) => s + (c.outstandingBalance || 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;

  const monthlyLiving = totalMonthlyExpenses + totalMonthlyEMI;
  const emergencyFundMonths = monthlyLiving > 0 ? (profile.emergencyFundAmount || 0) / monthlyLiving : 0;

  const dtiScore      = clamp(scoreDTI(monthlyIncome, totalMonthlyEMI));
  const savingsScore  = clamp(scoreSavings(monthlyIncome, totalMonthlyExpenses, totalMonthlyEMI));
  const emergencyScore = clamp(scoreEmergencyFund(profile.emergencyFundAmount || 0, monthlyLiving));
  const creditScore   = clamp(scoreCreditUtilization(profile.creditCards || []));
  const expenseScore  = clamp(scoreExpenseRatio(monthlyIncome, totalMonthlyExpenses));

  const totalScore = Math.round(
    dtiScore * WEIGHTS.dti +
    savingsScore * WEIGHTS.savings +
    emergencyScore * WEIGHTS.emergency +
    creditScore * WEIGHTS.credit +
    expenseScore * WEIGHTS.expense
  );

  return {
    totalScore: clamp(totalScore),
    grade: getGrade(totalScore),
    components: { dtiScore, savingsScore, emergencyScore, creditScore, expenseScore },
    metrics: {
      monthlyIncome: Math.round(monthlyIncome),
      totalMonthlyEMI: Math.round(totalMonthlyEMI),
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
      savingsRate: Math.round(savingsRate * 10) / 10,
      dtiRatio: Math.round(dtiRatio * 10) / 10,
      creditUtilization: Math.round(creditUtilization * 10) / 10,
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10
    }
  };
};

module.exports = { calculateScore, getGrade, WEIGHTS };
