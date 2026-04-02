const prisma = require('../config/database');

exports.getRecommendations = async (req, res, next) => {
  try {
    const recs = await prisma.recommendation.findMany({
      where: { userId: req.user.id, isDismissed: false },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      take: 8
    });
    res.status(200).json({ success: true, data: { recommendations: recs, count: recs.length } });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    await prisma.recommendation.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { isRead: true }
    });
    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error) { next(error); }
};

exports.dismiss = async (req, res, next) => {
  try {
    await prisma.recommendation.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { isDismissed: true }
    });
    res.status(200).json({ success: true, message: 'Recommendation dismissed.' });
  } catch (error) { next(error); }
};
