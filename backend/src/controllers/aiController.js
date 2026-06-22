/**
 * AI Controller — Proxy endpoints for Gemini recommendations & Groq chat
 * All AI API keys stay server-side, never exposed to the frontend.
 */

const { callGemini, callGroqChat } = require('../services/aiService');

// ─── POST /api/v1/ai/recommendations ─────────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'prompt is required.' });
    }

    const recs = await callGemini(prompt);

    const formatted = recs.map((rec, i) => ({
      id: `gemini-${i}-${Date.now()}`,
      _id: `gemini-${i}-${Date.now()}`,
      title: rec.title ?? 'Recommendation',
      description: rec.description ?? '',
      actionStep: rec.actionStep ?? '',
      calculation: rec.calculation ?? '',
      impact: rec.impact ?? '',
      whyPeopleAvoid: rec.whyPeopleAvoid ?? '',
      priority: rec.priority ?? 'medium',
      category: rec.category ?? 'savings',
      projectedScoreImpact: typeof rec.projectedScoreImpact === 'number' ? rec.projectedScoreImpact : null,
      timeToComplete: rec.timeToComplete ?? null,
      linkedGoalCategory: rec.linkedGoalCategory && rec.linkedGoalCategory !== 'null' ? rec.linkedGoalCategory : null,
      source: 'gemini',
      isRead: false,
      isDismissed: false,
    }));

    res.json({ success: true, data: formatted });
  } catch (e) { next(e); }
};

// ─── POST /api/v1/ai/chat ────────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required.' });
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ success: false, message: 'Each message must have role and content.' });
      }
    }

    const reply = await callGroqChat(messages);
    res.json({ success: true, data: { reply } });
  } catch (e) { next(e); }
};
