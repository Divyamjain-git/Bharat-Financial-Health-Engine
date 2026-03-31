/**
 * Recommendation Engine
 * Rule-based system that generates personalized financial recommendations
 * Maximum 8 recommendations per score calculation
 */

/**
 * generateRecommendations
 * @param {Object} metrics     - Computed metrics from scoring engine
 * @param {Object} components  - Component scores
 * @param {Array}  loans       - Active loans
 * @returns {Array} recommendations (max 8)
 */
const generateRecommendations = (metrics, components, loans = []) => {
  const recommendations = [];

  const {
    dtiRatio, savingsRate, emergencyFundMonths,
    creditUtilization, monthlyIncome, totalMonthlyExpenses, totalMonthlyEMI
  } = metrics;

  // ─── Rule 1: High DTI Ratio ──────────────────────────────────────────────
  if (dtiRatio > 50) {
    recommendations.push({
      category: 'debt',
      priority: 'high',
      title: 'Reduce Your Debt Load',
      description: `Your Debt-to-Income ratio is ${dtiRatio.toFixed(1)}%, which is critically high. More than half your income goes toward loan repayments, leaving little for savings or emergencies.`,
      actionStep: 'Focus on prepaying the highest-interest loan first (avalanche method). Even ₹1,000–₹2,000 extra per month can significantly reduce your debt tenure.'
    });
  } else if (dtiRatio > 35) {
    recommendations.push({
      category: 'debt',
      priority: 'medium',
      title: 'Work on Reducing EMI Burden',
      description: `Your DTI ratio is ${dtiRatio.toFixed(1)}%. While manageable, reducing it below 35% will significantly improve your financial flexibility.`,
      actionStep: 'Avoid taking any new loans. Direct any bonuses or windfalls toward loan prepayment.'
    });
  }

  // ─── Rule 2: Low Savings Rate ────────────────────────────────────────────
  if (savingsRate < 0) {
    recommendations.push({
      category: 'savings',
      priority: 'high',
      title: '⚠️ You Are Spending More Than You Earn',
      description: 'Your expenses and EMIs exceed your income. This is a financial emergency that needs immediate attention.',
      actionStep: 'Track every expense for 30 days using an app like ET Money or Walnut. Identify and cut all non-essential spending immediately.'
    });
  } else if (savingsRate < 10) {
    recommendations.push({
      category: 'savings',
      priority: 'high',
      title: 'Increase Your Monthly Savings',
      description: `You're only saving ${savingsRate.toFixed(1)}% of your income. The recommended minimum is 20% for long-term financial security.`,
      actionStep: 'Set up a SIP of at least ₹500/month in a liquid fund. Automate it on salary day so you save before you spend.'
    });
  } else if (savingsRate < 20) {
    recommendations.push({
      category: 'savings',
      priority: 'medium',
      title: 'Boost Your Savings Rate',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is decent but aim for 20%+ to build long-term wealth.`,
      actionStep: 'Increase your SIP amount by ₹500 each quarter. Consider NPS for tax-efficient long-term savings under Section 80CCD.'
    });
  }

  // ─── Rule 3: Low Emergency Fund ──────────────────────────────────────────
  if (emergencyFundMonths < 1) {
    recommendations.push({
      category: 'emergency',
      priority: 'high',
      title: 'Build Emergency Fund Immediately',
      description: 'You have virtually no emergency fund. A job loss or medical emergency could force you into debt.',
      actionStep: 'Open a separate savings account and immediately park ₹5,000–₹10,000. Target 3 months of expenses as your first milestone.'
    });
  } else if (emergencyFundMonths < 3) {
    recommendations.push({
      category: 'emergency',
      priority: 'high',
      title: 'Strengthen Your Emergency Fund',
      description: `You have only ${emergencyFundMonths.toFixed(1)} months of expenses saved. The recommended minimum is 3–6 months.`,
      actionStep: 'Keep emergency funds in a high-yield savings account or liquid mutual fund (Paytm Money, Groww). Target reaching 3 months of expenses first.'
    });
  } else if (emergencyFundMonths < 6) {
    recommendations.push({
      category: 'emergency',
      priority: 'medium',
      title: 'Grow Emergency Fund to 6 Months',
      description: `You have ${emergencyFundMonths.toFixed(1)} months covered. Ideally, build this to 6 months for full protection.`,
      actionStep: 'Allocate 5% of any windfall income (bonus, tax refund) directly to your emergency fund.'
    });
  }

  // ─── Rule 4: High Credit Utilization ─────────────────────────────────────
  if (creditUtilization > 75) {
    recommendations.push({
      category: 'credit',
      priority: 'high',
      title: 'Critical: Reduce Credit Card Usage',
      description: `You're using ${creditUtilization.toFixed(1)}% of your credit limit. This severely damages your credit score and signals financial stress.`,
      actionStep: 'Pay more than the minimum due immediately. Aim to bring utilization below 30%. Avoid using credit cards for EMI purchases temporarily.'
    });
  } else if (creditUtilization > 30) {
    recommendations.push({
      category: 'credit',
      priority: 'medium',
      title: 'Reduce Credit Card Outstanding',
      description: `Credit utilization of ${creditUtilization.toFixed(1)}% is above the healthy threshold of 30%. This can negatively affect your CIBIL score.`,
      actionStep: 'Pay off credit card balances in full each month to avoid interest charges (which can be 36–42% annually).'
    });
  }

  // ─── Rule 5: High Expense Ratio ──────────────────────────────────────────
  const expenseRatio = monthlyIncome > 0 ? (totalMonthlyExpenses / monthlyIncome) * 100 : 0;
  if (expenseRatio > 75) {
    recommendations.push({
      category: 'expenses',
      priority: 'medium',
      title: 'Optimize Your Monthly Expenses',
      description: `${expenseRatio.toFixed(1)}% of your income goes toward household expenses alone. Review discretionary spending to free up more for savings.`,
      actionStep: 'Audit subscriptions, dining out, and entertainment. Switching to home-cooked meals 3x per week can save ₹2,000–₹5,000 monthly.'
    });
  }

  // ─── Rule 6: Multiple High-Interest Loans ────────────────────────────────
  const highInterestLoans = loans.filter(l => l.interestRate > 14 && l.isActive);
  if (highInterestLoans.length >= 2) {
    recommendations.push({
      category: 'debt',
      priority: 'medium',
      title: 'Consolidate High-Interest Loans',
      description: `You have ${highInterestLoans.length} loans with interest rates above 14%. Consider debt consolidation to reduce your overall interest burden.`,
      actionStep: 'Explore a personal loan at a lower rate (10–12%) to consolidate expensive loans. Many banks offer this for salaried employees with good CIBIL scores.'
    });
  }

  // ─── Rule 7: Good Score Encouragement ────────────────────────────────────
  if (savingsRate >= 20 && dtiRatio < 30 && emergencyFundMonths >= 3) {
    recommendations.push({
      category: 'investment',
      priority: 'low',
      title: 'Start Wealth Building',
      description: 'Your financial foundation is solid! It\'s time to make your money work harder through investments.',
      actionStep: 'Consider investing 15% of income in equity mutual funds via SIP for long-term wealth. Tax-saving ELSS funds offer dual benefits under Section 80C.'
    });
  }

  // ─── Rule 8: No investment mentioned ────────────────────────────────────
  if (monthlyIncome > 30000 && savingsRate > 10 && recommendations.length < 6) {
    recommendations.push({
      category: 'investment',
      priority: 'low',
      title: 'Maximize Tax Savings under 80C',
      description: 'You can save up to ₹46,800 in taxes annually by fully utilizing the ₹1.5L deduction under Section 80C.',
      actionStep: 'Invest in PPF, ELSS, or NPS to claim deductions. LIC, ULIP, and home loan principal also qualify. Consult a SEBI-registered advisor.'
    });
  }

  // ─── Sort by priority and limit to 8 ────────────────────────────────────
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 8);
};

module.exports = { generateRecommendations };
