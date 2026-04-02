const prisma = require('../config/database');
const { analyzeGoal, suggestGoals } = require('../services/goalEngine');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id, status: { not: 'cancelled' } },
      include: { milestones: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, data: { goals } });
  } catch (e) { next(e); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { milestones, ...goalData } = req.body;
    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        ...goalData,
        milestones: milestones?.length
          ? { create: milestones.map(m => ({ title: m.title, targetAmount: m.targetAmount })) }
          : undefined
      },
      include: { milestones: true }
    });
    res.status(201).json({ success: true, message: 'Goal created!', data: { goal } });
  } catch (e) { next(e); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const { milestones, ...updateData } = req.body;

    let goal = await prisma.goal.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { milestones: true }
    });

    // Auto-mark achieved
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal = await prisma.goal.update({
        where: { id: goal.id },
        data: { status: 'achieved', achievedAt: new Date() },
        include: { milestones: true }
      });
    }

    res.json({ success: true, data: { goal } });
  } catch (e) { next(e); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const goal = await prisma.goal.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'cancelled' }
    });
    res.json({ success: true, message: 'Goal cancelled.' });
  } catch (e) { next(e); }
};

exports.analyzeGoal = async (req, res, next) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { milestones: true }
    });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!score) return res.status(400).json({ success: false, message: 'Complete your profile first.' });

    const analysis = analyzeGoal(goal, score.monthlyIncome, score.savingsRate);
    res.json({ success: true, data: { analysis } });
  } catch (e) { next(e); }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id, status: 'active' }
    });
    if (!score) return res.json({ success: true, data: { suggestions: [] } });

    const metrics = {
      monthlyIncome: score.monthlyIncome,
      totalMonthlyEMI: score.totalMonthlyEMI,
      totalMonthlyExpenses: score.totalMonthlyExpenses,
      savingsRate: score.savingsRate,
      dtiRatio: score.dtiRatio,
      creditUtilization: score.creditUtilization,
      emergencyFundMonths: score.emergencyFundMonths
    };
    const suggestions = suggestGoals(metrics, goals);
    res.json({ success: true, data: { suggestions } });
  } catch (e) { next(e); }
};
