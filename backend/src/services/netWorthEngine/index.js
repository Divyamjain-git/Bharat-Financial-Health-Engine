/**
 * Net Worth Engine
 * Calculates net worth breakdown, asset allocation, and trend analysis
 */

const ASSET_CATEGORY_LABELS = {
  cash_savings: 'Cash & Savings', fixed_deposit: 'Fixed Deposits',
  mutual_funds: 'Mutual Funds', stocks: 'Stocks & Equity',
  ppf_epf: 'PPF / EPF', real_estate: 'Real Estate',
  gold: 'Gold', crypto: 'Crypto', nps: 'NPS', other: 'Other'
};

const LIABILITY_CATEGORY_LABELS = {
  home_loan: 'Home Loan', vehicle_loan: 'Vehicle Loan',
  personal_loan: 'Personal Loan', education_loan: 'Education Loan',
  credit_card: 'Credit Card Debt', business_loan: 'Business Loan', other: 'Other'
};

/**
 * Calculate comprehensive net worth analysis
 */
const analyzeNetWorth = (netWorthDoc, scoreMetrics) => {
  const totalAssets = netWorthDoc.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const totalLiabilities = netWorthDoc.liabilities.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Asset allocation breakdown
  const assetBreakdown = {};
  netWorthDoc.assets.forEach(asset => {
    const label = ASSET_CATEGORY_LABELS[asset.category] || asset.category;
    assetBreakdown[label] = (assetBreakdown[label] || 0) + asset.currentValue;
  });

  // Liability breakdown
  const liabilityBreakdown = {};
  netWorthDoc.liabilities.forEach(liability => {
    const label = LIABILITY_CATEGORY_LABELS[liability.category] || liability.category;
    liabilityBreakdown[label] = (liabilityBreakdown[label] || 0) + liability.outstandingAmount;
  });

  // Solvency ratio (assets / liabilities)
  const solvencyRatio = totalLiabilities > 0
    ? Math.round((totalAssets / totalLiabilities) * 100) / 100
    : null;

  // Liquid assets (cash + FD + MF)
  const liquidAssets = netWorthDoc.assets
    .filter(a => ['cash_savings', 'fixed_deposit', 'mutual_funds'].includes(a.category))
    .reduce((s, a) => s + a.currentValue, 0);

  // Liquidity ratio
  const liquidityRatio = totalLiabilities > 0
    ? Math.round((liquidAssets / totalLiabilities) * 100) / 100
    : null;

  // Grade net worth
  const monthlyIncome = scoreMetrics?.monthlyIncome || 0;
  let netWorthGrade = 'Building';
  if (monthlyIncome > 0) {
    const netWorthToIncomeRatio = netWorth / (monthlyIncome * 12);
    if (netWorthToIncomeRatio > 5) netWorthGrade = 'Wealthy';
    else if (netWorthToIncomeRatio > 2) netWorthGrade = 'Comfortable';
    else if (netWorthToIncomeRatio > 0.5) netWorthGrade = 'Building';
    else if (netWorth > 0) netWorthGrade = 'Starting';
    else netWorthGrade = 'In Debt';
  }

  return {
    totalAssets, totalLiabilities, netWorth,
    assetBreakdown, liabilityBreakdown,
    solvencyRatio, liquidityRatio, liquidAssets,
    netWorthGrade
  };
};

module.exports = { analyzeNetWorth, ASSET_CATEGORY_LABELS, LIABILITY_CATEGORY_LABELS };
