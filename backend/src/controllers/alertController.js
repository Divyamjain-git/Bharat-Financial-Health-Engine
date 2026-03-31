const Alert = require('../models/Alert');
const Score = require('../models/Score');
const Goal = require('../models/Goal');
const { generateAlerts } = require('../services/alertEngine');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id, isDismissed: false })
      .sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Alert.countDocuments({ userId: req.user._id, isRead: false, isDismissed: false });
    res.json({ success: true, data: { alerts, unreadCount } });
  } catch (e) { next(e); }
};

exports.generateAlerts = async (req, res, next) => {
  try {
    const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(2);
    if (scores.length === 0) return res.json({ success: true, data: { generated: 0 } });
    const current = scores[0];
    const prev = scores[1] || null;
    const goals = await Goal.find({ userId: req.user._id, status: 'active' });
    const newAlerts = generateAlerts(
      current.metrics,
      prev ? prev.totalScore : null,
      current.totalScore,
      goals
    );
    // Remove old auto-generated alerts of same type, then insert new ones
    if (newAlerts.length > 0) {
      const types = [...new Set(newAlerts.map(a => a.type))];
      await Alert.deleteMany({ userId: req.user._id, type: { $in: types }, isDismissed: false });
      await Alert.insertMany(newAlerts.map(a => ({ ...a, userId: req.user._id })));
    }
    res.json({ success: true, data: { generated: newAlerts.length } });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await Alert.updateMany({ userId: req.user._id }, { isRead: true });
    } else {
      await Alert.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    }
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.dismiss = async (req, res, next) => {
  try {
    await Alert.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isDismissed: true });
    res.json({ success: true });
  } catch (e) { next(e); }
};
