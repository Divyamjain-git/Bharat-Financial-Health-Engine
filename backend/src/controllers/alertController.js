const prisma = require('../config/database');
const { generateAlerts } = require('../services/alertEngine');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id, isDismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    const unreadCount = await prisma.alert.count({
      where: { userId: req.user.id, isRead: false, isDismissed: false }
    });
    res.json({ success: true, data: { alerts, unreadCount } });
  } catch (e) { next(e); }
};

exports.generateAlerts = async (req, res, next) => {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 2
    });
    if (scores.length === 0) return res.json({ success: true, data: { generated: 0 } });

    const current = scores[0];
    const prev = scores[1] || null;

    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id, status: 'active' }
    });

    const metrics = {
      monthlyIncome: current.monthlyIncome,
      totalMonthlyEMI: current.totalMonthlyEMI,
      totalMonthlyExpenses: current.totalMonthlyExpenses,
      savingsRate: current.savingsRate,
      dtiRatio: current.dtiRatio,
      creditUtilization: current.creditUtilization,
      emergencyFundMonths: current.emergencyFundMonths,
    };

    const newAlerts = generateAlerts(
      metrics,
      prev ? prev.totalScore : null,
      current.totalScore,
      goals
    );

    if (newAlerts.length > 0) {
      const types = [...new Set(newAlerts.map(a => a.type))];
      await prisma.alert.deleteMany({
        where: { userId: req.user.id, type: { in: types }, isDismissed: false }
      });
      await prisma.alert.createMany({
        data: newAlerts.map(a => ({ ...a, userId: req.user.id }))
      });
    }

    res.json({ success: true, data: { generated: newAlerts.length } });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await prisma.alert.updateMany({
        where: { userId: req.user.id },
        data: { isRead: true }
      });
    } else {
      await prisma.alert.updateMany({
        where: { id: parseInt(req.params.id), userId: req.user.id },
        data: { isRead: true }
      });
    }
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.dismiss = async (req, res, next) => {
  try {
    await prisma.alert.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { isDismissed: true }
    });
    res.json({ success: true });
  } catch (e) { next(e); }
};
