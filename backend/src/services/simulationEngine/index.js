/**
 * Simulation Engine — "What-if" financial scenario simulator
 */

const runSimulation = (baseMetrics, changes, baseScoreResult) => {
  const simMetrics = {
    monthlyIncome: baseMetrics.monthlyIncome + (changes.incomeChange || 0),
    totalMonthlyEMI: Math.max(0, baseMetrics.totalMonthlyEMI + (changes.emiChange || 0)),
    totalMonthlyExpenses: Math.max(0, baseMetrics.totalMonthlyExpenses + (changes.expenseChange || 0)),
    creditUtilization: Math.max(0, Math.min(100, baseMetrics.creditUtilization + (changes.creditChange || 0))),
    emergencyFundMonths: Math.max(0, baseMetrics.emergencyFundMonths + (changes.emergencyChange || 0))
  };

  const monthlySavings = simMetrics.monthlyIncome - simMetrics.totalMonthlyExpenses - simMetrics.totalMonthlyEMI;
  simMetrics.savingsRate = simMetrics.monthlyIncome > 0
    ? (monthlySavings / simMetrics.monthlyIncome) * 100 : 0;
  simMetrics.dtiRatio = simMetrics.monthlyIncome > 0
    ? (simMetrics.totalMonthlyEMI / simMetrics.monthlyIncome) * 100 : 0;

  const clamp = (v) => Math.min(100, Math.max(0, v));

  const dtiScore = clamp(simMetrics.dtiRatio < 20 ? 100 :
    simMetrics.dtiRatio < 35 ? 80 :
    simMetrics.dtiRatio < 50 ? 50 : simMetrics.dtiRatio < 60 ? 25 : 0);

  const savingsScore = clamp(simMetrics.savingsRate >= 30 ? 100 :
    simMetrics.savingsRate >= 20 ? 80 + ((simMetrics.savingsRate - 20) / 10) * 20 :
    simMetrics.savingsRate >= 10 ? 60 + ((simMetrics.savingsRate - 10) / 10) * 20 :
    simMetrics.savingsRate >= 5  ? 30 + ((simMetrics.savingsRate - 5)  / 5)  * 30 :
    simMetrics.savingsRate >= 0  ? (simMetrics.savingsRate / 5) * 30 : 0);

  const emergencyScore = clamp(simMetrics.emergencyFundMonths >= 6 ? 100 :
    simMetrics.emergencyFundMonths >= 3 ? 75 :
    simMetrics.emergencyFundMonths >= 1 ? 40 : 0);

  const creditScore = clamp(simMetrics.creditUtilization < 10 ? 100 :
    simMetrics.creditUtilization < 30 ? 85 :
    simMetrics.creditUtilization < 50 ? 60 :
    simMetrics.creditUtilization < 75 ? 30 : 0);

  const expenseRatio = simMetrics.monthlyIncome > 0
    ? (simMetrics.totalMonthlyExpenses / simMetrics.monthlyIncome) * 100 : 100;
  const expenseScore = clamp(expenseRatio < 40 ? 100 :
    expenseRatio < 60 ? 75 :
    expenseRatio < 75 ? 45 :
    expenseRatio < 90 ? 20 : 0);

  const simScore = Math.round(
    dtiScore * 0.25 + savingsScore * 0.20 +
    emergencyScore * 0.20 + creditScore * 0.20 + expenseScore * 0.15
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
  if (changes.incomeChange > 0) insights.push(`+₹${changes.incomeChange.toLocaleString('en-IN')} income boosts your savings rate by ${(simMetrics.savingsRate - baseMetrics.savingsRate).toFixed(1)}%`);
  if (changes.emiChange < 0) insights.push(`Removing this EMI frees up ₹${Math.abs(changes.emiChange).toLocaleString('en-IN')}/month`);
  if (changes.expenseChange < 0) insights.push(`Cutting ₹${Math.abs(changes.expenseChange).toLocaleString('en-IN')} in expenses improves your score by ${scoreDiff > 0 ? '+' : ''}${scoreDiff} points`);
  if (scoreDiff > 10) insights.push(`This change would move you to the "${getGrade(simScore)}" grade!`);

  return {
    originalScore: baseScoreResult.totalScore,
    simulatedScore: clamp(simScore),
    scoreDiff,
    simulatedGrade: getGrade(simScore),
    simulatedMetrics: {
      ...simMetrics,
      dtiRatio: Math.round(simMetrics.dtiRatio * 10) / 10,
      savingsRate: Math.round(simMetrics.savingsRate * 10) / 10
    },
    insights,
    components: { dtiScore, savingsScore, emergencyScore, creditScore, expenseScore }
  };
};

/**
 * Prebuilt scenario templates
 * Fix: placeholder zeros replaced with sentinel value null — the SimulationPage
 * must compute real changes from user metrics before calling runSimulation.
 * The "label" and "description" are what the UI shows; "changes" are defaults
 * that the page overrides dynamically.
 */
const SCENARIO_TEMPLATES = [
  {
    id: 'pay_off_loan',
    label: 'Pay off a loan',
    icon: '🏦',
    description: 'What if you eliminated one EMI?',
    // UI should subtract the selected loan EMI; this is a safe default
    changes: { emiChange: -5000 }
  },
  {
    id: 'salary_hike',
    label: '20% salary hike',
    icon: '💰',
    description: 'Impact of a 20% salary increase',
    // Fix: use a percentage flag; SimulationPage multiplies monthlyIncome by 0.20
    changes: { incomeChangePct: 0.20 }
  },
  {
    id: 'reduce_expenses',
    label: 'Cut expenses 15%',
    icon: '✂️',
    description: 'What if you reduced spending by 15%?',
    // Fix: use a percentage flag; SimulationPage multiplies totalMonthlyExpenses by -0.15
    changes: { expenseChangePct: -0.15 }
  },
  {
    id: 'build_emergency',
    label: 'Build emergency fund',
    icon: '🛡️',
    description: 'Add 3 months to your emergency fund',
    changes: { emergencyChange: 3 }
  },
  {
    id: 'reduce_credit',
    label: 'Pay off credit cards',
    icon: '💳',
    description: 'Bring credit utilization to 10%',
    // Fix: use a sentinel; SimulationPage computes (current - 10) as the delta
    changes: { creditChangePct: 'to_10_pct' }
  }
];

module.exports = { runSimulation, SCENARIO_TEMPLATES };
