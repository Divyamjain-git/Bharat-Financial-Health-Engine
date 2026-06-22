/**
 * AI Service — Server-side proxy for Gemini & Groq API calls
 * Keeps API keys secure on the backend, never exposed to the browser.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Gemini: Generate AI Recommendations ──────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured on the server.');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 4000, topP: 0.9, topK: 40 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();

  let recs;
  try { recs = JSON.parse(cleaned); }
  catch { const m = cleaned.match(/\[[\s\S]*\]/); recs = m ? JSON.parse(m[0]) : []; }

  return Array.isArray(recs) ? recs : [];
}

// ─── Groq: AI Chat ────────────────────────────────────────────────────────────
async function callGroqChat(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured on the server.');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[GroqChat] API error:', response.status, text);
    throw new Error(`Groq API error ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

module.exports = { callGemini, callGroqChat };
