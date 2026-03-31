/**
 * Loan Controller
 */

const Loan = require('../models/Loan');
const FinancialProfile = require('../models/FinancialProfile');
const Score = require('../models/Score');
const Recommendation = require('../models/Recommendation');
const { calculateScore } = require('../services/scoringEngine');
const { generateRecommendations } = require('../services/recommendationEngine');

const recalculate = async (userId) => {
  const profile = await FinancialProfile.findOne({ userId });
  if (!profile) return;
  const loans = await Loan.find({ userId, isActive: true });
  const result = calculateScore(profile, loans);
  const score = await Score.create({ userId, ...result });
  await Recommendation.deleteMany({ userId, isDismissed: false });
  const recs = generateRecommendations(result.metrics, result.components, loans)
    .map(r => ({ ...r, userId, scoreId: score._id }));
  if (recs.length) await Recommendation.insertMany(recs);
  profile.lastScoreCalculatedAt = new Date();
  await profile.save({ validateBeforeSave: false });
};

exports.getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { loans, count: loans.length } });
  } catch (error) { next(error); }
};

exports.addLoan = async (req, res, next) => {
  try {
    const loan = await Loan.create({ userId: req.user._id, ...req.body });
    await recalculate(req.user._id);
    res.status(201).json({ success: true, message: 'Loan added and score updated!', data: { loan } });
  } catch (error) { next(error); }
};

exports.updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    await recalculate(req.user._id);
    res.status(200).json({ success: true, message: 'Loan updated and score recalculated!', data: { loan } });
  } catch (error) { next(error); }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    await recalculate(req.user._id);
    res.status(200).json({ success: true, message: 'Loan removed and score updated!' });
  } catch (error) { next(error); }
};
