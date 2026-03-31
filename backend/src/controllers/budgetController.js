const Budget = require('../models/Budget');
const Score = require('../models/Score');

exports.getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ userId: req.user._id });
    if (!budget) {
      // Auto-create from latest score
      const score = await Score.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      // Fix: use a clear, unambiguous variable name for income — avoid shadowing
      const monthlyIncome = score?.metrics?.monthlyIncome || 0;
      budget = await Budget.create({
        userId: req.user._id,
        monthlyIncome,
        month: new Date().toISOString().slice(0, 7)
      });
    }

    // Fix: use budget.monthlyIncome directly, no inner function shadowing
    const inc = budget.monthlyIncome;
    const analysis = {
      needsBudget:   Math.round(inc * (budget.needsPercent   / 100)),
      wantsBudget:   Math.round(inc * (budget.wantsPercent   / 100)),
      savingsBudget: Math.round(inc * (budget.savingsPercent / 100)),
      needsActual:   Object.values(budget.needs   || {}).reduce((s, v) => s + (v?.actual || 0), 0),
      wantsActual:   Object.values(budget.wants   || {}).reduce((s, v) => s + (v?.actual || 0), 0),
      savingsActual: Object.values(budget.savings || {}).reduce((s, v) => s + (v?.actual || 0), 0),
    };
    res.json({ success: true, data: { budget, analysis } });
  } catch (e) { next(e); }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, userId: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: { budget } });
  } catch (e) { next(e); }
};
