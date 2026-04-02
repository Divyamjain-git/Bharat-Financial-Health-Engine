const prisma = require('../config/database');
const { calculateScore } = require('../services/scoringEngine');
const { generateRecommendations } = require('../services/recommendationEngine');

const recalculate = async (userId) => {
  const profile = await prisma.financialProfile.findUnique({
    where: { userId },
    include: { creditCards: true }
  });
  if (!profile) return;

  const loans = await prisma.loan.findMany({ where: { userId, isActive: true } });

  const profileObj = {
    ...profile,
    expenses: {
      houseRent: profile.houseRent, groceries: profile.groceries,
      electricityBill: profile.electricityBill, gasBill: profile.gasBill,
      waterBill: profile.waterBill, internetMobile: profile.internetMobile,
      medicalExpenses: profile.medicalExpenses, vehicleFuel: profile.vehicleFuel,
      schoolFees: profile.schoolFees, otherExpenses: profile.otherExpenses,
    },
    creditCards: profile.creditCards || [],
    totalMonthlyIncome: profile.netMonthlySalary > 0
      ? profile.netMonthlySalary + (profile.annualBonus / 12) + profile.otherMonthlyIncome
      : profile.avgMonthlyProfit,
  };

  const result = calculateScore(profileObj, loans);

  const score = await prisma.score.create({
    data: {
      userId,
      totalScore: result.totalScore,
      grade: result.grade,
      dtiScore: result.components.dtiScore,
      savingsScore: result.components.savingsScore,
      emergencyScore: result.components.emergencyScore,
      creditScore: result.components.creditScore,
      expenseScore: result.components.expenseScore,
      monthlyIncome: result.metrics.monthlyIncome,
      totalMonthlyEMI: result.metrics.totalMonthlyEMI,
      totalMonthlyExpenses: result.metrics.totalMonthlyExpenses,
      savingsRate: result.metrics.savingsRate,
      dtiRatio: result.metrics.dtiRatio,
      creditUtilization: result.metrics.creditUtilization,
      emergencyFundMonths: result.metrics.emergencyFundMonths,
    }
  });

  await prisma.recommendation.deleteMany({ where: { userId, isDismissed: false } });
  const recs = generateRecommendations(result.metrics, result.components, loans);
  if (recs.length) {
    await prisma.recommendation.createMany({
      data: recs.map(r => ({ ...r, userId, scoreId: score.id }))
    });
  }

  await prisma.financialProfile.update({
    where: { userId },
    data: { lastScoreCalculatedAt: new Date() }
  });
};

exports.getLoans = async (req, res, next) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: { loans, count: loans.length } });
  } catch (error) { next(error); }
};

exports.addLoan = async (req, res, next) => {
  try {
    const loan = await prisma.loan.create({
      data: { userId: req.user.id, ...req.body }
    });
    await recalculate(req.user.id);
    res.status(201).json({ success: true, message: 'Loan added and score updated!', data: { loan } });
  } catch (error) { next(error); }
};

exports.updateLoan = async (req, res, next) => {
  try {
    const existing = await prisma.loan.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Loan not found.' });

    const loan = await prisma.loan.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    await recalculate(req.user.id);
    res.status(200).json({ success: true, message: 'Loan updated and score recalculated!', data: { loan } });
  } catch (error) { next(error); }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const existing = await prisma.loan.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Loan not found.' });

    const loan = await prisma.loan.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });
    await recalculate(req.user.id);
    res.status(200).json({ success: true, message: 'Loan removed and score updated!' });
  } catch (error) { next(error); }
};
