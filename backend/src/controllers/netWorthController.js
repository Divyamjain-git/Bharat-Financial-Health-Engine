const NetWorth = require('../models/NetWorth');
const Score = require('../models/Score');
const { analyzeNetWorth } = require('../services/netWorthEngine');

const getOrCreate = async (userId) => {
  let nw = await NetWorth.findOne({ userId });
  if (!nw) nw = await NetWorth.create({ userId, assets: [], liabilities: [] });
  return nw;
};

exports.getNetWorth = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    const score = await Score.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const analysis = analyzeNetWorth(nw, score?.metrics);
    res.json({ success: true, data: { netWorth: nw, analysis } });
  } catch (e) { next(e); }
};

exports.addAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    nw.assets.push(req.body);
    // Fix: save first so virtuals (totalAssets, totalLiabilities, netWorth) reflect the
    // newly pushed asset, then take an accurate snapshot
    await nw.save();
    nw.snapshots.push({
      totalAssets: nw.totalAssets,
      totalLiabilities: nw.totalLiabilities,
      netWorth: nw.netWorth
    });
    await nw.save();
    res.json({ success: true, message: 'Asset added!', data: { netWorth: nw } });
  } catch (e) { next(e); }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    const asset = nw.assets.id(req.params.assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
    Object.assign(asset, req.body);
    await nw.save();
    res.json({ success: true, data: { netWorth: nw } });
  } catch (e) { next(e); }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    nw.assets.pull({ _id: req.params.assetId });
    await nw.save();
    // Fix: return netWorth in response so frontend slice can update state
    res.json({ success: true, message: 'Asset removed.', data: { netWorth: nw } });
  } catch (e) { next(e); }
};

exports.addLiability = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    nw.liabilities.push(req.body);
    await nw.save();
    res.json({ success: true, data: { netWorth: nw } });
  } catch (e) { next(e); }
};

exports.deleteLiability = async (req, res, next) => {
  try {
    const nw = await getOrCreate(req.user._id);
    nw.liabilities.pull({ _id: req.params.liabilityId });
    await nw.save();
    // Fix: return netWorth in response so frontend slice can update state
    res.json({ success: true, message: 'Liability removed.', data: { netWorth: nw } });
  } catch (e) { next(e); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const nw = await NetWorth.findOne({ userId: req.user._id });
    if (!nw) return res.json({ success: true, data: { history: [] } });
    const history = (nw.snapshots || []).slice(-30);
    res.json({ success: true, data: { history } });
  } catch (e) { next(e); }
};
