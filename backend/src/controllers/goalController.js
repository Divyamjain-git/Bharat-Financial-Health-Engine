const Goal = require('../models/Goal');
const Score = require('../models/Score');
const { analyzeGoal, suggestGoals } = require('../services/goalEngine');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id, status: { $ne: 'cancelled' } }).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, data: { goals } });
  } catch (e) { next(e); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, message: 'Goal created!', data: { goal } });
  } catch (e) { next(e); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    // Auto-mark achieved
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'achieved'; goal.achievedAt = new Date();
      await goal.save();
    }
    res.json({ success: true, data: { goal } });
  } catch (e) { next(e); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    // Fix: check the goal exists and belongs to this user before cancelling
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal cancelled.' });
  } catch (e) { next(e); }
};

exports.analyzeGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    const score = await Score.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!score) return res.status(400).json({ success: false, message: 'Complete your profile first.' });
    const analysis = analyzeGoal(goal, score.metrics.monthlyIncome, score.metrics.savingsRate);
    res.json({ success: true, data: { analysis } });
  } catch (e) { next(e); }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const score = await Score.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const goals = await Goal.find({ userId: req.user._id, status: 'active' });
    if (!score) return res.json({ success: true, data: { suggestions: [] } });
    const suggestions = suggestGoals(score.metrics, goals);
    res.json({ success: true, data: { suggestions } });
  } catch (e) { next(e); }
};
