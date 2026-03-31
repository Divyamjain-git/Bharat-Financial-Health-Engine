/**
 * Gemini AI Service — Personalised Financial Recommendations
 * Calls Google Gemini API directly from the frontend with the user's
 * full financial context to generate actionable, specific advice.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Build a rich, structured prompt from the user's financial data.
 * The more context Gemini has, the more specific and useful the advice.
 */
function buildPrompt({ user, score, profile, goals, netWorth }) {
  const metrics  = score?.metrics   ?? {};
  const components = score?.components ?? {};
  const expenses = profile?.expenses ?? {};
  const loans    = profile?.loans    ?? [];

  const expenseLines = Object.entries(expenses)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  - ${k}: ₹${v.toLocaleString('en-IN')}`)
    .join('\n');

  const loanLines = loans.length > 0
    ? loans.map(l => `  - ${l.loanType} loan: ₹${l.monthlyEMI}/mo EMI @ ${l.interestRate}% p.a.`).join('\n')
    : '  - No loans';

  const goalLines = goals?.filter(g => g.status === 'active').length > 0
    ? goals.filter(g => g.status === 'active')
        .map(g => `  - ${g.title}: ₹${g.currentAmount?.toLocaleString('en-IN')} saved of ₹${g.targetAmount?.toLocaleString('en-IN')} target`)
        .join('\n')
    : '  - No active goals set';

  const nwSummary = netWorth
    ? `Total assets ₹${netWorth.totalAssets?.toLocaleString('en-IN')}, liabilities ₹${netWorth.totalLiabilities?.toLocaleString('en-IN')}, net worth ₹${netWorth.netWorth?.toLocaleString('en-IN')}`
    : 'Not provided';

  return `You are a certified financial advisor specialising in personal finance for Indian salaried and self-employed individuals. 
Analyse the following real financial data and generate exactly 5 personalised, actionable recommendations.

USER FINANCIAL PROFILE
======================
Name: ${user?.name ?? 'User'}
Employment type: ${user?.role ?? 'salaried'}

FINANCIAL HEALTH SCORE
Score: ${score?.totalScore ?? 'N/A'} / 100  (Grade: ${score?.grade ?? 'N/A'})
Score components:
  - DTI score: ${components.dtiScore ?? 'N/A'}
  - Savings score: ${components.savingsScore ?? 'N/A'}
  - Emergency fund score: ${components.emergencyScore ?? 'N/A'}
  - Credit score: ${components.creditScore ?? 'N/A'}
  - Expense score: ${components.expenseScore ?? 'N/A'}

KEY METRICS
  - Monthly income: ₹${metrics.monthlyIncome?.toLocaleString('en-IN') ?? 'N/A'}
  - Total monthly EMI: ₹${metrics.totalMonthlyEMI?.toLocaleString('en-IN') ?? 0}
  - Debt-to-income ratio: ${metrics.dtiRatio?.toFixed(1) ?? 'N/A'}%
  - Monthly savings: ₹${metrics.monthlySavings?.toLocaleString('en-IN') ?? 'N/A'}
  - Savings rate: ${metrics.savingsRate?.toFixed(1) ?? 'N/A'}%
  - Emergency fund: ${metrics.emergencyFundMonths?.toFixed(1) ?? 0} months of expenses
  - Credit utilization: ${metrics.creditUtilization?.toFixed(1) ?? 'N/A'}%

MONTHLY EXPENSES
${expenseLines || '  - No expense data'}

LOANS & EMIs
${loanLines}

ACTIVE FINANCIAL GOALS
${goalLines}

NET WORTH SUMMARY
${nwSummary}

INSTRUCTIONS
============
Generate exactly 5 recommendations. Each must be:
1. SPECIFIC to this person's actual numbers (mention actual ₹ amounts, percentages, ratios)
2. ACTIONABLE — tell them exactly what to do, not vague advice
3. PRIORITISED — address their weakest score components first
4. INDIA-SPECIFIC — mention relevant Indian instruments (PPF, ELSS, NPS, FD, SIP, etc.) where appropriate
5. CONCISE — title max 8 words, description max 2 sentences

Respond with ONLY a valid JSON array. No markdown, no explanation, just the array:
[
  {
    "title": "Short actionable title",
    "description": "Specific advice mentioning their actual numbers and what to do.",
    "priority": "high" | "medium" | "low",
    "category": "savings" | "debt" | "emergency" | "credit" | "investment" | "expense"
  }
]

Priority rules:
- "high" if it addresses a score component below 50 or a critical ratio (DTI > 50%, emergency < 3 months, credit > 50%)
- "medium" if it addresses a score component between 50–75
- "low" if it's an optimisation on an already-decent metric`;
}

/**
 * Fetch AI-powered recommendations from Gemini.
 * Falls back to an empty array on any failure so the UI degrades gracefully.
 */
export async function fetchGeminiRecommendations(financialContext) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini] REACT_APP_GEMINI_API_KEY is not set — skipping AI recommendations.');
    return [];
  }

  const prompt = buildPrompt(financialContext);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,       // lower = more factual, consistent advice
        maxOutputTokens: 1024,
        topP: 0.8,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip any accidental markdown fences Gemini might add
  const cleaned = raw.replace(/```json|```/g, '').trim();

  const recommendations = JSON.parse(cleaned);

  // Normalise: add a stable id and ensure required fields exist
  return recommendations.map((rec, i) => ({
    _id:         `gemini-${i}`,
    title:       rec.title       ?? 'Recommendation',
    description: rec.description ?? '',
    priority:    rec.priority    ?? 'medium',
    category:    rec.category    ?? 'savings',
    source:      'gemini',
  }));
}