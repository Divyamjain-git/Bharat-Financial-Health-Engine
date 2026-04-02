const prisma = require('../config/database');
const { runSimulation, SCENARIO_TEMPLATES } = require('../services/simulationEngine');

exports.getTemplates = async (req, res) => {
  res.json({ success: true, data: { templates: SCENARIO_TEMPLATES } });
};

exports.simulate = async (req, res, next) => {
  try {
    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!score) return res.status(400).json({ success: false, message: 'Complete your profile first to run simulations.' });

    const metrics = {
      monthlyIncome: score.monthlyIncome,
      totalMonthlyEMI: score.totalMonthlyEMI,
      totalMonthlyExpenses: score.totalMonthlyExpenses,
      savingsRate: score.savingsRate,
      dtiRatio: score.dtiRatio,
      creditUtilization: score.creditUtilization,
      emergencyFundMonths: score.emergencyFundMonths,
    };
    const { changes } = req.body;
    const result = runSimulation(metrics, changes, score);
    res.json({ success: true, data: { simulation: result } });
  } catch (e) { next(e); }
};

exports.getScoreInsights = async (req, res, next) => {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    if (scores.length < 2) return res.json({ success: true, data: { insights: [], trend: 'insufficient_data' } });

    const recent = scores.slice(0, 7);
    const older = scores.slice(7, 14);
    const recentAvg = recent.reduce((s, sc) => s + sc.totalScore, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((s, sc) => s + sc.totalScore, 0) / older.length : recentAvg;
    const trend = recentAvg > olderAvg + 3 ? 'improving' : recentAvg < olderAvg - 3 ? 'declining' : 'stable';

    const componentAverages = {};
    const compKeys = ['dtiScore', 'savingsScore', 'emergencyScore', 'creditScore', 'expenseScore'];
    compKeys.forEach(k => {
      componentAverages[k] = Math.round(recent.reduce((s, sc) => s + (sc[k] || 0), 0) / recent.length);
    });
    const sorted = Object.entries(componentAverages).sort((a, b) => a[1] - b[1]);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    const compLabels = {
      dtiScore: 'Debt-to-Income', savingsScore: 'Savings Rate',
      emergencyScore: 'Emergency Fund', creditScore: 'Credit Utilization', expenseScore: 'Expense Ratio'
    };

    const insights = [
      { type: 'trend', message: `Your score trend is ${trend} over the last 7 updates.`, value: trend },
      { type: 'strength', message: `Your strongest area is ${compLabels[strongest[0]]} (avg ${strongest[1]}/100).`, value: strongest[1] },
      { type: 'weakness', message: `Focus on improving ${compLabels[weakest[0]]} (avg ${weakest[1]}/100).`, value: weakest[1] }
    ];

    res.json({ success: true, data: { insights, trend, componentAverages, recentAvg: Math.round(recentAvg) } });
  } catch (e) { next(e); }
};

exports.getPeerComparison = async (req, res, next) => {
  try {
    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!score) return res.status(400).json({ success: false, message: 'Complete your profile first.' });

    const incomeRange = score.monthlyIncome;
    let peers;
    if (incomeRange < 30000) {
      peers = { avgScore: 45, avgDTI: 42, avgSavings: 8, avgEmergency: 1.2, label: '< ₹30K/month' };
    } else if (incomeRange < 75000) {
      peers = { avgScore: 55, avgDTI: 35, avgSavings: 14, avgEmergency: 2.1, label: '₹30K–75K/month' };
    } else if (incomeRange < 150000) {
      peers = { avgScore: 63, avgDTI: 30, avgSavings: 19, avgEmergency: 3.0, label: '₹75K–1.5L/month' };
    } else {
      peers = { avgScore: 71, avgDTI: 24, avgSavings: 26, avgEmergency: 4.5, label: '> ₹1.5L/month' };
    }

    const percentile = Math.round(Math.min(99, Math.max(1,
      50 + ((score.totalScore - peers.avgScore) / peers.avgScore) * 100
    )));

    res.json({
      success: true,
      data: {
        userScore: score.totalScore,
        userMetrics: {
          monthlyIncome: score.monthlyIncome,
          dtiRatio: score.dtiRatio,
          savingsRate: score.savingsRate,
          emergencyFundMonths: score.emergencyFundMonths
        },
        peers,
        percentile,
        comparison: {
          score: { user: score.totalScore, peer: peers.avgScore, better: score.totalScore > peers.avgScore },
          dti: { user: score.dtiRatio, peer: peers.avgDTI, better: score.dtiRatio < peers.avgDTI },
          savings: { user: score.savingsRate, peer: peers.avgSavings, better: score.savingsRate > peers.avgSavings },
          emergency: { user: score.emergencyFundMonths, peer: peers.avgEmergency, better: score.emergencyFundMonths > peers.avgEmergency }
        }
      }
    });
  } catch (e) { next(e); }
};
