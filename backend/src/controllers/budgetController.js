const prisma = require('../config/database');

exports.getBudget = async (req, res, next) => {
  try {
    let budget = await prisma.budget.findUnique({ where: { userId: req.user.id } });

    if (!budget) {
      const score = await prisma.score.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      const monthlyIncome = score?.monthlyIncome || 0;
      budget = await prisma.budget.create({
        data: {
          userId: req.user.id,
          monthlyIncome,
          month: new Date().toISOString().slice(0, 7)
        }
      });
    }

    const inc = budget.monthlyIncome;
    const analysis = {
      needsBudget:   Math.round(inc * (budget.needsPercent   / 100)),
      wantsBudget:   Math.round(inc * (budget.wantsPercent   / 100)),
      savingsBudget: Math.round(inc * (budget.savingsPercent / 100)),
      needsActual: (budget.needsHouseRentActual || 0) + (budget.needsGroceriesActual || 0) +
                   (budget.needsUtilitiesActual || 0) + (budget.needsTransportActual || 0) +
                   (budget.needsInsuranceActual || 0) + (budget.needsMedicalActual || 0) +
                   (budget.needsLoanEMIsActual || 0),
      wantsActual: (budget.wantsDiningActual || 0) + (budget.wantsEntertainmentActual || 0) +
                   (budget.wantsShoppingActual || 0) + (budget.wantsSubscriptionsActual || 0) +
                   (budget.wantsTravelActual || 0),
      savingsActual: (budget.savingsEmergencyActual || 0) + (budget.savingsInvestmentsActual || 0) +
                     (budget.savingsGoalsActual || 0),
    };

    res.json({ success: true, data: { budget, analysis } });
  } catch (e) { next(e); }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.upsert({
      where: { userId: req.user.id },
      update: { ...req.body },
      create: { userId: req.user.id, monthlyIncome: 0, ...req.body }
    });
    res.json({ success: true, data: { budget } });
  } catch (e) { next(e); }
};
