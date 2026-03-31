/**
 * Recommendation Model
 * Stores personalized financial recommendations for users
 */

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score',
    default: null
  },

  // ── Recommendation Content ─────────────────────────────────────────────────
  category: {
    type: String,
    enum: ['debt', 'savings', 'emergency', 'credit', 'expenses', 'income', 'investment'],
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  actionStep: {
    type: String,
    trim: true,
    default: null
  },

  // ── Status ─────────────────────────────────────────────────────────────────
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false }

}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ userId: 1, isDismissed: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
