/**
 * Recommendation Controller
 */

const Recommendation = require('../models/Recommendation');

exports.getRecommendations = async (req, res, next) => {
  try {
    const recs = await Recommendation.find({ userId: req.user._id, isDismissed: false })
      .sort({ priority: 1, createdAt: -1 })
      .limit(8);
    res.status(200).json({ success: true, data: { recommendations: recs, count: recs.length } });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Recommendation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error) { next(error); }
};

exports.dismiss = async (req, res, next) => {
  try {
    await Recommendation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDismissed: true }
    );
    res.status(200).json({ success: true, message: 'Recommendation dismissed.' });
  } catch (error) { next(error); }
};
