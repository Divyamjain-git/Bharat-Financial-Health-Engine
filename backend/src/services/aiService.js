/**
 * AI Service — Resilient Multi-Provider Engine (Groq + Gemini 2.5 Flash)
 * 
 * ✅ Primary: Groq API (openai/gpt-oss-120b / openai/gpt-oss-20b) — ultra fast & high throughput
 * ✅ Fallback: Google Gemini 2.5 Flash (latest official model)
 * ✅ Handles both Financial Recommendations & AI Chatbot
 * ✅ Automatic failover: if one provider or model fails, automatically tries the other
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Helper to clean and extract JSON array from model responses
 */
function extractJSONArray(text) {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // try to match [ ... ]
  }

  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('[AIService] Failed to parse matched JSON array:', e.message);
    }
  }
  return [];
}

/**
 * Call Groq with model fallback
 */
async function executeGroq(messages, { temperature = 0.3, max_tokens = 2500 } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured.');

  const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

  for (const model of candidateModels) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Groq] Model ${model} returned ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.warn(`[Groq] Error with model ${model}:`, err.message);
    }
  }

  throw new Error('All Groq candidate models failed.');
}

/**
 * Call Gemini 2.5 Flash
 */
async function executeGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured.');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 3000 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Generate AI Recommendations (Groq Primary, Gemini Fallback) ─────────────
async function callGemini(prompt) {
  // Try Groq first (fast, reliable, free)
  try {
    console.log('[AIService] Generating recommendations using Groq...');
    const groqReply = await executeGroq([
      {
        role: 'system',
        content: 'You are Bharat\'s smartest SEBI-registered financial advisor. Output only a valid JSON array of recommendations matching the user prompt. No conversational chatter or markdown backticks around the JSON array.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], { temperature: 0.2, max_tokens: 3000 });

    const recs = extractJSONArray(groqReply);
    if (recs.length > 0) {
      console.log(`[AIService] Successfully generated ${recs.length} recommendations via Groq.`);
      return recs;
    }
    console.warn('[AIService] Groq did not return valid JSON array, falling back to Gemini...');
  } catch (err) {
    console.warn('[AIService] Groq recommendations failed:', err.message);
  }

  // Fallback: Gemini 2.5 Flash
  try {
    console.log('[AIService] Generating recommendations using Gemini 2.5 Flash...');
    const geminiReply = await executeGemini(prompt);
    const recs = extractJSONArray(geminiReply);
    if (recs.length > 0) {
      console.log(`[AIService] Successfully generated ${recs.length} recommendations via Gemini.`);
      return recs;
    }
  } catch (err) {
    console.error('[AIService] Gemini recommendations also failed:', err.message);
  }

  return [];
}

// ─── AI Chatbot (Groq Primary, Gemini Fallback) ──────────────────────────────
async function callGroqChat(messages) {
  // Try Groq first
  try {
    const reply = await executeGroq(messages, { temperature: 0.35, max_tokens: 600 });
    if (reply) return reply;
  } catch (err) {
    console.warn('[AIService] Groq chat failed, trying Gemini fallback:', err.message);
  }

  // Fallback: Gemini 2.5 Flash
  try {
    // Format conversation messages into a single prompt for Gemini
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const conversation = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'assistant' ? 'Advisor' : 'User'}: ${m.content}`)
      .join('\n');

    const prompt = `${systemMsg}\n\nRecent Conversation:\n${conversation}\n\nAdvisor response:`;
    const reply = await executeGemini(prompt);
    if (reply) return reply;
  } catch (err) {
    console.error('[AIService] Gemini chat fallback failed:', err.message);
  }

  return "I'm having trouble connecting to the AI services right now. Please try again in a few moments.";
}

module.exports = { callGemini, callGroqChat };
