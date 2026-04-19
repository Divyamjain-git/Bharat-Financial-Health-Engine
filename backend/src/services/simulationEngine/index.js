/**
 * Simulation Engine — "What-if" financial scenario simulator
 *
 * Bug fix: previously used coarse step functions (dtiRatio < 35 → flat 80)
 * while the real scoringEngine uses smooth linear interpolation within bands.
 * This caused the simulation's recalculated "original" score to diverge from
 * the stored score, so e.g. +₹50 income showed -2 points.
 * Now uses the exact same formulas as scoringEngine/index.js.
 */

const runSimulation = (baseMetrics, changes, baseScoreResult) => {
  // Apply the user's hypothetical changes to base metrics
  const simMetrics = {
    monthlyIncome:        baseMetrics.monthlyIncome        + (changes.incomeChange   || 0),
    totalMonthlyEMI:      Math.max(0, baseMetrics.totalMonthlyEMI      + (changes.emiChange      || 0)),
    totalMonthlyExpenses: Math.max(0, baseMetrics.totalMonthlyExpenses + (changes.expenseChange  || 0)),
    creditUtilization:    Math.max(0, Math.min(100, baseMetrics.creditUtilization + (changes.creditChange || 0))),
    emergencyFundMonths:  Math.max(0, baseMetrics.emergencyFundMonths  + (changes.emergencyChange || 0))
  };

  const monthlySavings    = simMetrics.monthlyIncome - simMetrics.totalMonthlyExpenses - simMetrics.totalMonthlyEMI;
  simMetrics.savingsRate  = simMetrics.monthlyIncome > 0 ? (monthlySavings / simMetrics.monthlyIncome) * 100 : 0;
  simMetrics.dtiRatio     = simMetrics.monthlyIncome > 0 ? (simMetrics.totalMonthlyEMI / simMetrics.monthlyIncome) * 100 : 0;

  const clamp = (v) => Math.min(100, Math.max(0, v));

  // ── Linear-interpolation scoring (matches scoringEngine exactly) ──────────

  // DTI Score
  const dti = simMetrics.dtiRatio;
  const dtiScore = clamp(
    simMetrics.monthlyIncome <= 0 ? 0 :
    dti < 20 ? 100 :
    dti < 35 ? Math.round(100 - ((dti - 20) / 15) * 20) :
    dti < 50 ? Math.round(80  - ((dti - 35) / 15) * 30) :
    dti < 60 ? Math.round(50  - ((dti - 50) / 10) * 25) :
               Math.round(Math.max(0, 25 - ((dti - 60) / 20) * 25))
  );

  // Savings Rate Score
  const rate = simMetrics.savingsRate;
  const savingsScore = clamp(
    simMetrics.monthlyIncome <= 0 ? 0 :
    rate >= 30 ? 100 :
    rate >= 20 ? Math.round(80 + ((rate - 20) / 10) * 20) :
    rate >= 10 ? Math.round(60 + ((rate - 10) / 10) * 20) :
    rate >= 5  ? Math.round(30 + ((rate - 5)  / 5)  * 30) :
    rate >= 0  ? Math.round((rate / 5) * 30) : 0
  );

  // Emergency Fund Score
  const em = simMetrics.emergencyFundMonths;
  const emergencyScore = clamp(
    em >= 6 ? 100 :
    em >= 4 ? Math.round(75 + ((em - 4) / 2) * 25) :
    em >= 2 ? Math.round(50 + ((em - 2) / 2) * 25) :
    em >= 1 ? Math.round(25 + (em - 1) * 25) :
              Math.round(em * 25)
  );

  // Credit Utilization Score
  const util = simMetrics.creditUtilization;
  const creditScore = clamp(
    util < 10 ? 100 :
    util < 30 ? Math.round(100 - ((util - 10) / 20) * 20) :
    util < 50 ? Math.round(80  - ((util - 30) / 20) * 30) :
    util < 75 ? Math.round(50  - ((util - 50) / 25) * 30) :
                Math.round(Math.max(0, 20 - ((util - 75) / 25) * 20))
  );

  // Expense Ratio Score
  const expRatio = simMetrics.monthlyIncome > 0
    ? (simMetrics.totalMonthlyExpenses / simMetrics.monthlyIncome) * 100 : 100;
  const expenseScore = clamp(
    expRatio < 40 ? 100 :
    expRatio < 60 ? Math.round(100 - ((expRatio - 40) / 20) * 30) :
    expRatio < 75 ? Math.round(70  - ((expRatio - 60) / 15) * 30) :
    expRatio < 90 ? Math.round(40  - ((expRatio - 75) / 15) * 25) :
                    Math.round(Math.max(0, 15 - ((expRatio - 90) / 10) * 15))
  );

  // ─────────────────────────────────────────────────────────────────────────

  const simScore = Math.round(
    dtiScore    * 0.25 +
    savingsScore  * 0.20 +
    emergencyScore * 0.20 +
    creditScore   * 0.20 +
    expenseScore  * 0.15
  );

  const scoreDiff = simScore - baseScoreResult.totalScore;

  const getGrade = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 65) return 'Good';
    if (s >= 50) return 'Fair';
    if (s >= 35) return 'Poor';
    return 'Critical';
  };

  const insights = [];
  if (changes.incomeChange > 0)
    insights.push(`+₹${changes.incomeChange.toLocaleString('en-IN')} income boosts your savings rate by ${(simMetrics.savingsRate - baseMetrics.savingsRate).toFixed(1)}%`);
  if (changes.emiChange < 0)
    insights.push(`Removing this EMI frees up ₹${Math.abs(changes.emiChange).toLocaleString('en-IN')}/month`);
  if (changes.expenseChange < 0)
    insights.push(`Cutting ₹${Math.abs(changes.expenseChange).toLocaleString('en-IN')} in expenses ${scoreDiff > 0 ? `improves your score by +${scoreDiff}` : `changes your score by ${scoreDiff}`} points`);
  if (scoreDiff > 10)
    insights.push(`This change would move you to the "${getGrade(simScore)}" grade!`);
  if (scoreDiff === 0)
    insights.push('This change is too small to measurably impact your score.');

  return {
    originalScore:    baseScoreResult.totalScore,
    simulatedScore:   clamp(simScore),
    scoreDiff,
    simulatedGrade:   getGrade(simScore),
    simulatedMetrics: {
      ...simMetrics,
      dtiRatio:    Math.round(simMetrics.dtiRatio    * 10) / 10,
      savingsRate: Math.round(simMetrics.savingsRate * 10) / 10
    },
    insights,
    components: { dtiScore, savingsScore, emergencyScore, creditScore, expenseScore }
  };
};

/**
 * Prebuilt scenario templates
 */
const SCENARIO_TEMPLATES = [
  { id: 'pay_off_loan',    label: 'Pay off a loan',         icon: '🏦', description: 'What if you eliminated one EMI?',                changes: { emiChange: -5000 } },
  { id: 'salary_hike',     label: '20% salary hike',        icon: '💰', description: 'Impact of a 20% salary increase',               changes: { incomeChangePct: 0.20 } },
  { id: 'reduce_expenses', label: 'Cut expenses 15%',       icon: '✂️', description: 'What if you reduced spending by 15%?',           changes: { expenseChangePct: -0.15 } },
  { id: 'build_emergency', label: 'Build emergency fund',   icon: '🛡️', description: 'Add 3 months to your emergency fund',           changes: { emergencyChange: 3 } },
  { id: 'reduce_credit',   label: 'Pay off credit cards',   icon: '💳', description: 'Bring credit utilization to 10%',               changes: { creditChangePct: 'to_10_pct' } }
];

module.exports = { runSimulation, SCENARIO_TEMPLATES };
