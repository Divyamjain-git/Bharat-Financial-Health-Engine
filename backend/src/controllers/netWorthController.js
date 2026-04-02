const prisma = require('../config/database');
const { analyzeNetWorth } = require('../services/netWorthEngine');

const getOrCreate = async (userId) => {
  let nw = await prisma.netWorth.findUnique({
    where: { userId },
    include: { assets: true, liabilities: true, snapshots: true }
  });
  if (!nw) {
    nw = await prisma.netWorth.create({
      data: { userId },
      include: { assets: true, liabilities: true, snapshots: true }
    });
  }
  return nw;
};

const computeTotals = (nw) => {
  const totalAssets = nw.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const totalLiabilities = nw.liabilities.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
  return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
};

exports.getNetWorth = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    const score = await prisma.score.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    const metrics = score ? {
      monthlyIncome: score.monthlyIncome,
      totalMonthlyEMI: score.totalMonthlyEMI,
      savingsRate: score.savingsRate
    } : null;
    const { totalAssets, totalLiabilities, netWorth } = computeTotals(nw);
    const analysis = analyzeNetWorth({ ...nw, totalAssets, totalLiabilities, netWorth }, metrics);
    res.json({ success: true, data: { netWorth: { ...nw, totalAssets, totalLiabilities, netWorth }, analysis } });
  } catch (e) { next(e); }
};

exports.addAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    await prisma.asset.create({
      data: { netWorthId: nw.id, ...req.body }
    });
    const updated = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { assets: true, liabilities: true, snapshots: true }
    });
    const { totalAssets, totalLiabilities, netWorth } = computeTotals(updated);
    // Save snapshot
    await prisma.snapshot.create({
      data: { netWorthId: nw.id, totalAssets, totalLiabilities, netWorthValue: netWorth }
    });
    res.json({ success: true, message: 'Asset added!', data: { netWorth: { ...updated, totalAssets, totalLiabilities, netWorth } } });
  } catch (e) { next(e); }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    const asset = await prisma.asset.findFirst({
      where: { id: parseInt(req.params.assetId), netWorthId: nw.id }
    });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });

    await prisma.asset.update({ where: { id: parseInt(req.params.assetId) }, data: req.body });
    const updated = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { assets: true, liabilities: true, snapshots: true }
    });
    const totals = computeTotals(updated);
    res.json({ success: true, data: { netWorth: { ...updated, ...totals } } });
  } catch (e) { next(e); }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    await prisma.asset.deleteMany({
      where: { id: parseInt(req.params.assetId), netWorthId: nw.id }
    });
    const updated = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { assets: true, liabilities: true, snapshots: true }
    });
    const totals = computeTotals(updated);
    res.json({ success: true, message: 'Asset removed.', data: { netWorth: { ...updated, ...totals } } });
  } catch (e) { next(e); }
};

exports.addLiability = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    await prisma.liability.create({ data: { netWorthId: nw.id, ...req.body } });
    const updated = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { assets: true, liabilities: true, snapshots: true }
    });
    const totals = computeTotals(updated);
    res.json({ success: true, data: { netWorth: { ...updated, ...totals } } });
  } catch (e) { next(e); }
};

exports.deleteLiability = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user.id);
    await prisma.liability.deleteMany({
      where: { id: parseInt(req.params.liabilityId), netWorthId: nw.id }
    });
    const updated = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { assets: true, liabilities: true, snapshots: true }
    });
    const totals = computeTotals(updated);
    res.json({ success: true, message: 'Liability removed.', data: { netWorth: { ...updated, ...totals } } });
  } catch (e) { next(e); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const nw = await prisma.netWorth.findUnique({
      where: { userId: req.user.id },
      include: { snapshots: { orderBy: { recordedAt: 'asc' }, take: 30 } }
    });
    if (!nw) return res.json({ success: true, data: { history: [] } });
    res.json({ success: true, data: { history: nw.snapshots } });
  } catch (e) { next(e); }
};
