/**
 * Alert Engine
 * Generates smart financial alerts based on metrics and changes
 */

/**
 * generateAlerts — Rule-based alert generation
 */
const generateAlerts = (metrics, prevScore, currentScore, goals = [], netWorth = null) => {
  const alerts = [];

  // ── Score Change Alerts ──────────────────────────────────────────────────
  if (prevScore !== null && currentScore !== null) {
    const scoreDiff = currentScore - prevScore;
    if (scoreDiff <= -10) {
      alerts.push({
        type: 'score_drop',
        severity: 'critical',
        title: `Score dropped by ${Math.abs(scoreDiff)} points`,
        message: `Your financial health score fell from ${prevScore} to ${currentScore}. Review your recent spending and EMI changes.`,
        actionLabel: 'View Dashboard',
        actionRoute: '/dashboard'
      });
    } else if (scoreDiff >= 10) {
      alerts.push({
        type: 'score_improve',
        severity: 'success',
        title: `Score improved by ${scoreDiff} points! 🎉`,
        message: `Great work! Your score rose from ${prevScore} to ${currentScore}. Keep up the momentum.`,
        actionLabel: 'See What Helped',
        actionRoute: '/dashboard'
      });
    }
  }

  // ── DTI Alert ─────────────────────────────────────────────────────────────
  if (metrics.dtiRatio > 60) {
    alerts.push({
      type: 'high_dti',
      severity: 'critical',
      title: 'Debt load is dangerously high',
      message: `Your DTI ratio is ${metrics.dtiRatio.toFixed(1)}%. Over 60% of your income goes to loan repayments — you have very little financial breathing room.`,
      actionLabel: 'Reduce Debt',
      actionRoute: '/dashboard',
      metadata: { dtiRatio: metrics.dtiRatio }
    });
  } else if (metrics.dtiRatio > 45) {
    alerts.push({
      type: 'high_dti',
      severity: 'warning',
      title: 'High debt-to-income ratio',
      message: `Your DTI of ${metrics.dtiRatio.toFixed(1)}% is above the recommended 40%. Consider prepaying loans.`,
      metadata: { dtiRatio: metrics.dtiRatio }
    });
  }

  // ── Savings Alert ─────────────────────────────────────────────────────────
  if (metrics.savingsRate < 0) {
    alerts.push({
      type: 'low_savings',
      severity: 'critical',
      title: 'Spending exceeds income!',
      message: `You are spending ₹${Math.abs(Math.round(metrics.monthlyIncome - metrics.totalMonthlyExpenses - metrics.totalMonthlyEMI)).toLocaleString('en-IN')} more than you earn each month.`,
      actionLabel: 'Plan Budget',
      actionRoute: '/budget'
    });
  } else if (metrics.savingsRate < 10) {
    alerts.push({
      type: 'low_savings',
      severity: 'warning',
      title: 'Savings rate is critically low',
      message: `Only ${metrics.savingsRate.toFixed(1)}% of your income is being saved. Aim for at least 20% for financial security.`,
      actionLabel: 'Smart Budget',
      actionRoute: '/budget'
    });
  }

  // ── Credit Utilization Alert ──────────────────────────────────────────────
  if (metrics.creditUtilization > 75) {
    alerts.push({
      type: 'credit_danger',
      severity: 'critical',
      title: 'Credit card utilization is critical',
      message: `You're using ${metrics.creditUtilization.toFixed(1)}% of your credit limit. This severely harms your CIBIL score. Pay down balances immediately.`,
      metadata: { utilization: metrics.creditUtilization }
    });
  }

  // ── Emergency Fund Alert ──────────────────────────────────────────────────
  if (metrics.emergencyFundMonths < 1) {
    alerts.push({
      type: 'emergency_fund_low',
      severity: 'critical',
      title: 'No emergency fund!',
      message: 'You have less than 1 month of expenses saved for emergencies. A single unexpected event could force you into debt.',
      actionLabel: 'Set Goal',
      actionRoute: '/goals'
    });
  } else if (metrics.emergencyFundMonths < 3) {
    alerts.push({
      type: 'emergency_fund_low',
      severity: 'warning',
      title: 'Emergency fund is insufficient',
      message: `You have ${metrics.emergencyFundMonths.toFixed(1)} months covered. Build this to at least 3 months as a safety net.`,
      actionLabel: 'Set Goal',
      actionRoute: '/goals'
    });
  }

  // ── Goal Deadline Alerts ──────────────────────────────────────────────────
  goals.forEach(goal => {
    if (goal.status !== 'active') return;
    const months = goal.monthsRemaining || 0;
    if (months <= 2 && goal.progressPercent < 80) {
      alerts.push({
        type: 'goal_deadline',
        severity: 'warning',
        title: `Goal "${goal.title}" deadline approaching`,
        message: `Only ${months} month(s) left and you're at ${goal.progressPercent}% of your target. Consider increasing contributions.`,
        actionLabel: 'View Goals',
        actionRoute: '/goals',
        metadata: { goalId: goal._id }
      });
    }
    if (goal.progressPercent >= 100 && goal.status !== 'achieved') {
      alerts.push({
        type: 'goal_milestone',
        severity: 'success',
        title: `Goal "${goal.title}" achieved! 🎊`,
        message: `Congratulations! You've reached your financial goal of ₹${goal.targetAmount.toLocaleString('en-IN')}.`,
        metadata: { goalId: goal._id }
      });
    }
  });

  return alerts.slice(0, 10); // max 10 alerts
};

module.exports = { generateAlerts };
