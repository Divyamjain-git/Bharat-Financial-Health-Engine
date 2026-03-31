/**
 * Goal Engine Service
 * Analyzes goal feasibility and generates projections
 */

/**
 * analyzeGoal — Check if a goal is achievable and suggest adjustments
 */
const analyzeGoal = (goal, monthlyIncome, currentSavingsRate) => {
  const remaining = goal.targetAmount - goal.currentAmount;
  const months = goal.monthsRemaining;
  const requiredMonthly = months > 0 ? remaining / months : remaining;
  const availableForGoals = monthlyIncome * (currentSavingsRate / 100);

  const feasibilityScore = availableForGoals >= requiredMonthly
    ? 100
    : Math.round((availableForGoals / requiredMonthly) * 100);

  let status = 'on_track';
  let message = '';

  if (feasibilityScore >= 100) {
    status = 'on_track';
    message = `You're on track! Save ₹${Math.round(requiredMonthly).toLocaleString('en-IN')}/month to hit this goal.`;
  } else if (feasibilityScore >= 70) {
    status = 'at_risk';
    message = `Slightly behind. Need ₹${Math.round(requiredMonthly - availableForGoals).toLocaleString('en-IN')} more per month.`;
  } else {
    status = 'off_track';
    // Calculate extended deadline
    const monthsNeeded = availableForGoals > 0 ? Math.ceil(remaining / availableForGoals) : 999;
    message = `At current savings, you'll reach this goal in ${monthsNeeded} months instead of ${months}.`;
  }

  // Projection: month-by-month growth (assuming 7% annual return on savings)
  const monthlyReturn = 0.07 / 12;
  const projection = [];
  let accumulated = goal.currentAmount;
  const monthly = Math.min(requiredMonthly, availableForGoals);

  for (let i = 1; i <= Math.min(months, 60); i++) {
    accumulated = accumulated * (1 + monthlyReturn) + monthly;
    if (i % 3 === 0 || i === months) {
      projection.push({
        month: i,
        amount: Math.round(accumulated),
        target: goal.targetAmount
      });
    }
  }

  return {
    feasibilityScore,
    status,
    message,
    requiredMonthly: Math.round(requiredMonthly),
    projection
  };
};

/**
 * Generate smart goal recommendations
 */
const suggestGoals = (metrics, existingGoals) => {
  const suggestions = [];
  const existingTypes = existingGoals.map(g => g.category);

  if (!existingTypes.includes('emergency_fund') && metrics.emergencyFundMonths < 3) {
    suggestions.push({
      category: 'emergency_fund',
      icon: '🛡️',
      title: 'Build Emergency Fund',
      description: 'Target 6 months of expenses as your safety net',
      suggestedAmount: Math.round(metrics.totalMonthlyExpenses * 6),
      priority: 'high'
    });
  }

  if (!existingTypes.includes('debt_freedom') && metrics.dtiRatio > 40) {
    suggestions.push({
      category: 'debt_freedom',
      icon: '🔓',
      title: 'Become Debt Free',
      description: 'Plan to eliminate all high-interest loans',
      priority: 'high'
    });
  }

  if (!existingTypes.includes('retirement') && metrics.monthlyIncome > 30000) {
    suggestions.push({
      category: 'retirement',
      icon: '🏖️',
      title: 'Retirement Corpus',
      description: 'Start building your retirement fund today',
      priority: 'medium'
    });
  }

  return suggestions;
};

module.exports = { analyzeGoal, suggestGoals };
