/**
 * Financial Profile Controller
 * Create, read, update profile + trigger score recalculation
 */

const FinancialProfile = require('../models/FinancialProfile');
const Loan = require('../models/Loan');
const Score = require('../models/Score');
const Recommendation = require('../models/Recommendation');
const { calculateScore } = require('../services/scoringEngine');
const { generateRecommendations } = require('../services/recommendationEngine');
const User = require('../models/User');

// ─── Helper: recalculate and persist score ────────────────────────────────────
const triggerScoreRecalculation = async (userId, profile) => {
  const loans = await Loan.find({ userId, isActive: true });
  const result = calculateScore(profile, loans);

  // Save score record (for trend history)
  const score = await Score.create({
    userId,
    totalScore: result.totalScore,
    grade: result.grade,
    components: result.components,
    metrics: result.metrics
  });

  // Generate new recommendations
  const recData = generateRecommendations(result.metrics, result.components, loans);
  if (recData.length > 0) {
    // Remove previous non-dismissed recommendations
    await Recommendation.deleteMany({ userId, isDismissed: false });
    const recs = recData.map(r => ({ ...r, userId, scoreId: score._id }));
    await Recommendation.insertMany(recs);
  }

  // Update profile timestamp
  profile.lastScoreCalculatedAt = new Date();
  await profile.save({ validateBeforeSave: false });

  return result;
};

// ─── GET profile ───────────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await FinancialProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Financial profile not found. Please complete onboarding.' });
    }
    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE profile ────────────────────────────────────────────────────────────
exports.createProfile = async (req, res, next) => {
  try {
    const existing = await FinancialProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Financial profile already exists. Use PUT to update.' });
    }

    const profile = await FinancialProfile.create({
      userId: req.user._id,
      ...req.body
    });

    // Mark onboarding complete
    await User.findByIdAndUpdate(req.user._id, { isOnboardingComplete: true });

    // Calculate initial score
    const scoreResult = await triggerScoreRecalculation(req.user._id, profile);

    res.status(201).json({
      success: true,
      message: 'Financial profile created and score calculated!',
      data: { profile, score: scoreResult }
    });

  } catch (error) {
    next(error);
  }
};

// ─── UPDATE profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await FinancialProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one first.' });
    }

    // Apply updates
    Object.assign(profile, req.body);
    await profile.save();

    // Recalculate score automatically
    const scoreResult = await triggerScoreRecalculation(req.user._id, profile);

    res.status(200).json({
      success: true,
      message: 'Profile updated and score recalculated!',
      data: { profile, score: scoreResult }
    });

  } catch (error) {
    next(error);
  }
};
