const prisma = require('../config/database');

exports.getLatestScore = async (req, res, next) => {
  try {
    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!score) {
      return res.status(404).json({ success: false, message: 'No score found. Please complete your financial profile.' });
    }
    // Shape response to match what frontend expects (components + metrics nested)
    const shaped = {
      ...score,
      components: {
        dtiScore: score.dtiScore,
        savingsScore: score.savingsScore,
        emergencyScore: score.emergencyScore,
        creditScore: score.creditScore,
        expenseScore: score.expenseScore,
      },
      metrics: {
        monthlyIncome: score.monthlyIncome,
        totalMonthlyEMI: score.totalMonthlyEMI,
        totalMonthlyExpenses: score.totalMonthlyExpenses,
        savingsRate: score.savingsRate,
        dtiRatio: score.dtiRatio,
        creditUtilization: score.creditUtilization,
        emergencyFundMonths: score.emergencyFundMonths,
      }
    };
    res.status(200).json({ success: true, data: { score: shaped } });
  } catch (error) { next(error); }
};

exports.getScoreHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true, totalScore: true, grade: true, createdAt: true }
    });
    res.status(200).json({ success: true, data: { scores, count: scores.length } });
  } catch (error) { next(error); }
};
