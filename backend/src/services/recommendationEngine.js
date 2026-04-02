/**
 * Recommendation Engine — Enhanced Rule-Based System
 * Generates up to 8 deeply personalized financial recommendations
 * with specific rupee amounts, actionable steps, and India-specific advice.
 */

const generateRecommendations = (metrics, components, loans = []) => {
  const recommendations = [];

  const {
    dtiRatio, savingsRate, emergencyFundMonths,
    creditUtilization, monthlyIncome, totalMonthlyExpenses,
    totalMonthlyEMI, emergencyFundAmount
  } = metrics;

  const dtiScore       = components.dtiScore       ?? 50;
  const savingsScore   = components.savingsScore   ?? 50;
  const emergencyScore = components.emergencyScore ?? 50;
  const creditScore    = components.creditScore    ?? 50;
  const expenseScore   = components.expenseScore   ?? 50;

  const disposable = monthlyIncome - totalMonthlyEMI - totalMonthlyExpenses;
  const annualIncome = monthlyIncome * 12;

  // ─── Rule 1: DTI Ratio ────────────────────────────────────────────────────
  if (dtiRatio > 60) {
    const extraEMI = Math.round(totalMonthlyEMI * 0.1);
    recommendations.push({
      category: 'debt',
      priority: 'high',
      title: 'Emergency: Debt Is Consuming Your Income',
      description: `Your debt-to-income ratio is ${dtiRatio.toFixed(1)}% — critically above the safe limit of 40%. You're paying ₹${totalMonthlyEMI?.toLocaleString('en-IN')} every month just in EMIs, leaving barely ₹${Math.max(0, disposable).toLocaleString('en-IN')} for everything else.`,
      actionStep: `Use the avalanche method: pay an extra ₹${extraEMI.toLocaleString('en-IN')}/month on your highest interest loan. Even this small step can cut your total interest by 15-20%.`
    });
  } else if (dtiRatio > 40) {
    recommendations.push({
      category: 'debt',
      priority: 'high',
      title: 'Reduce EMI Burden Below 40% of Income',
      description: `Your DTI is ${dtiRatio.toFixed(1)}%, above the healthy threshold of 40%. Your EMIs of ₹${totalMonthlyEMI?.toLocaleString('en-IN')}/month are squeezing your ability to save and invest.`,
      actionStep: `Avoid any new loans for 12 months. Direct any bonus or windfall toward prepaying your highest-rate loan to reduce the EMI burden.`
    });
  } else if (dtiRatio > 25) {
    recommendations.push({
      category: 'debt',
      priority: 'medium',
      title: 'Optimize Your Loan Portfolio',
      description: `Your DTI of ${dtiRatio.toFixed(1)}% is manageable but not ideal. Reducing it below 25% will significantly boost your financial flexibility and credit score.`,
      actionStep: `Check if any loan can be refinanced at a lower rate. A 1% rate reduction on a ₹10L loan saves ~₹600/month in EMI.`
    });
  }

  // ─── Rule 2: Savings Rate ────────────────────────────────────────────────
  if (savingsRate < 0) {
    recommendations.push({
      category: 'savings',
      priority: 'high',
      title: '🚨 You Are Spending More Than You Earn',
      description: `Your monthly expenses (₹${totalMonthlyExpenses?.toLocaleString('en-IN')}) plus EMIs (₹${totalMonthlyEMI?.toLocaleString('en-IN')}) exceed your income (₹${monthlyIncome?.toLocaleString('en-IN')}). This deficit compounds every month and leads to debt traps.`,
      actionStep: `Create a zero-based budget today using the app "Walnut" or "Money Manager". Identify 3 expenses you can cut immediately — subscriptions, dining out, and impulse spending are usually the first to find.`
    });
  } else if (savingsRate < 10) {
    const targetSaving = Math.round(monthlyIncome * 0.2);
    const currentSaving = Math.round(monthlyIncome * savingsRate / 100);
    const gap = targetSaving - currentSaving;
    recommendations.push({
      category: 'savings',
      priority: 'high',
      title: 'Automate Savings to Reach 20% Rate',
      description: `You're saving only ${savingsRate.toFixed(1)}% (≈₹${currentSaving.toLocaleString('en-IN')}/month) vs the recommended 20% (₹${targetSaving.toLocaleString('en-IN')}/month). The gap of ₹${gap.toLocaleString('en-IN')}/month is holding back your wealth building.`,
      actionStep: `Set up a ₹${Math.min(gap, disposable > 0 ? Math.round(disposable * 0.5) : 500).toLocaleString('en-IN')}/month SIP in a liquid fund on salary day via Groww or Zerodha. Automate it so you save before you spend.`
    });
  } else if (savingsRate < 20) {
    const boostAmount = Math.round(monthlyIncome * 0.05);
    recommendations.push({
      category: 'savings',
      priority: 'medium',
      title: `Push Savings from ${savingsRate.toFixed(0)}% to 20%`,
      description: `Your ${savingsRate.toFixed(1)}% savings rate is decent but increasing it by just 5% (₹${boostAmount.toLocaleString('en-IN')}/month more) could add ₹${(boostAmount * 12 * 10).toLocaleString('en-IN')} to your wealth over 10 years at 12% returns.`,
      actionStep: `Increase your existing SIP by ₹500 every 3 months (step-up SIP). Also consider NPS Tier-1 for additional ₹50,000 deduction under Section 80CCD(1B) — that's ₹15,600 in tax saved annually.`
    });
  }

  // ─── Rule 3: Emergency Fund ──────────────────────────────────────────────
  if (emergencyFundMonths < 1) {
    const target = Math.round(totalMonthlyExpenses * 3);
    recommendations.push({
      category: 'emergency',
      priority: 'high',
      title: 'Build Emergency Fund — Start with ₹10,000 This Week',
      description: `You have virtually no emergency fund. A single medical emergency or job loss could force you into high-interest debt (personal loans at 18-24%). Your 3-month target is ₹${target.toLocaleString('en-IN')}.`,
      actionStep: `Open a separate savings account (IDFC FIRST Bank at 7% or AU Small Finance at 7.25%) and transfer ₹10,000 immediately. Set up a ₹${Math.round(target / 6).toLocaleString('en-IN')}/month auto-transfer to reach your goal in 6 months.`
    });
  } else if (emergencyFundMonths < 3) {
    const additionalNeeded = Math.round((3 - emergencyFundMonths) * totalMonthlyExpenses);
    recommendations.push({
      category: 'emergency',
      priority: 'high',
      title: `Add ₹${additionalNeeded.toLocaleString('en-IN')} to Reach 3-Month Safety Net`,
      description: `You have ${emergencyFundMonths.toFixed(1)} months of expenses covered. You need ₹${additionalNeeded.toLocaleString('en-IN')} more to reach the minimum 3-month safety net recommended by financial planners.`,
      actionStep: `Park your emergency fund in a liquid mutual fund (Paytm Money or Kuvera) earning 6.5-7% — far better than a regular savings account at 3.5%. Redeem within 1 business day when needed.`
    });
  } else if (emergencyFundMonths < 6) {
    const additional = Math.round((6 - emergencyFundMonths) * totalMonthlyExpenses);
    recommendations.push({
      category: 'emergency',
      priority: 'medium',
      title: 'Grow Emergency Fund from 3 to 6 Months',
      description: `Good — you have ${emergencyFundMonths.toFixed(1)} months covered. Extending to 6 months requires ₹${additional.toLocaleString('en-IN')} more, giving you full protection for extended job loss or medical crisis.`,
      actionStep: `Allocate 50% of any bonus or tax refund directly to your emergency fund. Consider a sweep FD (auto-FD) which earns 7-7.5% while keeping funds accessible.`
    });
  }

  // ─── Rule 4: Credit Utilization ──────────────────────────────────────────
  if (creditUtilization > 75) {
    recommendations.push({
      category: 'credit',
      priority: 'high',
      title: 'Critical: Reduce Credit Card Usage to Below 30%',
      description: `You're using ${creditUtilization.toFixed(1)}% of your credit limit — this is severely damaging your CIBIL score (potentially by 50-100 points). High utilization signals financial distress to lenders and will affect your ability to get loans at good rates.`,
      actionStep: `Pay more than the minimum due this month. Request a credit limit increase from your card issuer (doesn't always require income proof). Target getting utilization below 30% within 3 months.`
    });
  } else if (creditUtilization > 30) {
    recommendations.push({
      category: 'credit',
      priority: 'medium',
      title: `Reduce Credit Utilization from ${creditUtilization.toFixed(0)}% to Under 30%`,
      description: `At ${creditUtilization.toFixed(1)}%, your credit utilization is above the optimal 30% threshold. Credit cards charge 36-42% annual interest on outstanding balances — the most expensive debt you can carry.`,
      actionStep: `Pay your full credit card balance every month, not just the minimum. Enable auto-pay for the full amount on your bank app to never miss a payment and avoid interest charges.`
    });
  } else if (creditUtilization <= 10 && creditUtilization > 0) {
    recommendations.push({
      category: 'credit',
      priority: 'low',
      title: 'Excellent Credit Utilization — Leverage It',
      description: `Your ${creditUtilization.toFixed(1)}% credit utilization is excellent and likely helping your CIBIL score. Use this strong credit profile to your advantage.`,
      actionStep: `Apply for a premium credit card (Axis Magnus, HDFC Regalia) with better rewards. Your good credit profile means you'll likely get approved and earn 3-5% back on spends through reward points.`
    });
  }

  // ─── Rule 5: Expense Ratio ───────────────────────────────────────────────
  const expenseRatio = monthlyIncome > 0 ? (totalMonthlyExpenses / monthlyIncome) * 100 : 0;
  if (expenseRatio > 80) {
    recommendations.push({
      category: 'expense',
      priority: 'high',
      title: 'Expenses Are Eating 80%+ of Your Income',
      description: `₹${totalMonthlyExpenses?.toLocaleString('en-IN')} in monthly expenses consumes ${expenseRatio.toFixed(1)}% of your income before EMIs. This leaves almost nothing for savings, investments, or unexpected costs.`,
      actionStep: `Do a 30-day expense audit. Track every rupee using "Walnut" or "CRED". Your top 3 cuttable categories are usually dining out (save ₹2,000-5,000), subscriptions (save ₹500-2,000), and impulse shopping.`
    });
  } else if (expenseRatio > 60) {
    recommendations.push({
      category: 'expense',
      priority: 'medium',
      title: 'Reduce Expense Ratio Below 50%',
      description: `Your expenses are ${expenseRatio.toFixed(1)}% of income. Following the 50/30/20 rule — 50% needs, 30% wants, 20% savings — would free up ₹${Math.round(monthlyIncome * 0.2).toLocaleString('en-IN')}/month for savings and investments.`,
      actionStep: `Review subscriptions (OTT, gym, apps) — cancel unused ones. Meal planning reduces grocery and dining costs by 20-30%. These small changes compound into ₹${Math.round(monthlyIncome * 0.05 * 12).toLocaleString('en-IN')}/year in savings.`
    });
  }

  // ─── Rule 6: High-interest loan consolidation ────────────────────────────
  const highRateLoans = loans.filter(l => l.interestRate > 14 && l.isActive !== false);
  if (highRateLoans.length >= 2) {
    const totalHighEMI = highRateLoans.reduce((s, l) => s + (l.monthlyEMI || 0), 0);
    const totalOutstanding = highRateLoans.reduce((s, l) => s + (l.outstandingBalance || 0), 0);
    recommendations.push({
      category: 'debt',
      priority: 'medium',
      title: `Consolidate ${highRateLoans.length} High-Interest Loans`,
      description: `You have ${highRateLoans.length} loans charging above 14% interest, totaling ₹${totalOutstanding.toLocaleString('en-IN')} outstanding and ₹${totalHighEMI.toLocaleString('en-IN')}/month in EMIs. Consolidating at 10-12% could save ₹${Math.round(totalOutstanding * 0.03 / 12).toLocaleString('en-IN')}/month.`,
      actionStep: `Check pre-approved personal loan offers on your bank's app (HDFC, ICICI, Axis) or on Bankbazaar.com. A debt consolidation loan at 11% vs 18% on ₹${totalOutstanding.toLocaleString('en-IN')} saves ~₹${Math.round(totalOutstanding * 0.07 / 12).toLocaleString('en-IN')}/month.`
    });
  }

  // ─── Rule 7: Tax Optimization ────────────────────────────────────────────
  if (annualIncome > 500000) {
    const taxSaving = annualIncome > 1500000 ? 46800 : annualIncome > 1000000 ? 31200 : 15600;
    recommendations.push({
      category: 'tax',
      priority: savingsScore > 60 ? 'medium' : 'low',
      title: `Save up to ₹${taxSaving.toLocaleString('en-IN')} in Taxes This Year`,
      description: `With an annual income of ₹${annualIncome.toLocaleString('en-IN')}, you can legally reduce your tax liability through 80C (₹1.5L), 80CCD(1B) NPS (₹50K extra), and 80D health insurance (₹25K). That's up to ₹2.25L in deductions.`,
      actionStep: `Start a ₹12,500/month ELSS SIP to exhaust 80C by March. Open NPS Tier-1 account (Zerodha, Groww) for the extra ₹50,000 deduction under 80CCD(1B). Total tax saved: up to ₹${taxSaving.toLocaleString('en-IN')}/year.`
    });
  }

  // ─── Rule 8: Wealth Building for Healthy Profiles ────────────────────────
  if (savingsRate >= 20 && dtiRatio < 30 && emergencyFundMonths >= 3) {
    const investAmount = Math.round(disposable * 0.6);
    recommendations.push({
      category: 'investment',
      priority: 'low',
      title: 'Your Foundation Is Strong — Now Build Wealth',
      description: `Congratulations — your financial fundamentals are solid. With ₹${disposable.toLocaleString('en-IN')}/month in disposable income, you're in a position to seriously build long-term wealth through equity investments.`,
      actionStep: `Start or increase a ₹${investAmount.toLocaleString('en-IN')}/month SIP split across: 60% index fund (Nifty 50 or Nifty 500), 30% mid-cap fund, 10% international fund. At 12% CAGR, this grows to ₹${Math.round(investAmount * 12 * ((Math.pow(1.12, 10) - 1) / 0.12)).toLocaleString('en-IN')} in 10 years.`
    });
  }

  // ─── Rule 9: Insurance Gap ────────────────────────────────────────────────
  if (monthlyIncome > 25000) {
    const termCover = annualIncome * 10;
    recommendations.push({
      category: 'insurance',
      priority: 'low',
      title: 'Protect Your Income with Term Insurance',
      description: `Your family needs a ₹${termCover.toLocaleString('en-IN')} term insurance cover (10x annual income = ₹${annualIncome.toLocaleString('en-IN')}). A ₹1 crore term plan for a 30-year-old costs just ₹8,000-12,000/year — not having it is the biggest financial risk.`,
      actionStep: `Get quotes on Policybazaar.com for a 30-35 year term plan. Choose a claim settlement ratio > 98% (LIC, HDFC Life, ICICI Pru). Also get a ₹5L health insurance floater for ₹12,000-18,000/year.`
    });
  }

  // ─── Sort and limit ───────────────────────────────────────────────────────
  const order = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => order[a.priority] - order[b.priority]);

  return recommendations.slice(0, 8);
};

module.exports = { generateRecommendations };