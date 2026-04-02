/**
 * Gemini AI Service — Elite Personalised Financial Recommendations
 * Uses gemini-2.0-flash with a deeply structured prompt for maximum quality.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : 'N/A';
const pct = (n) => n != null ? `${Number(n).toFixed(1)}%` : 'N/A';

function scoreLabel(s) {
  if (s >= 80) return 'Excellent';
  if (s >= 65) return 'Good';
  if (s >= 50) return 'Fair';
  if (s >= 35) return 'Weak';
  return 'Critical';
}

function gradeContext(score) {
  if (score >= 80) return 'This user is financially healthy. Focus on wealth optimization and advanced strategies.';
  if (score >= 65) return 'This user is doing well but has clear gaps. Focus on closing those gaps.';
  if (score >= 50) return 'This user is in an average position with significant room for improvement.';
  if (score >= 35) return 'This user is financially stressed. Focus on stabilization and damage control.';
  return 'This user is in a financially critical state. Prioritize immediate rescue actions.';
}

function buildExpenseAnalysis(expenses = {}, income) {
  const entries = Object.entries(expenses).filter(([, v]) => v > 0);
  if (!entries.length) return '  No expense data provided.';

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const lines = entries
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const share = income > 0 ? ((v / income) * 100).toFixed(1) : '?';
      const label = k.replace(/([A-Z])/g, ' $1').toLowerCase();
      return `  - ${label}: ${fmt(v)}/mo (${share}% of income)`;
    });
  lines.push(`  TOTAL: ${fmt(total)}/mo (${income > 0 ? ((total / income) * 100).toFixed(1) : '?'}% of income)`);
  return lines.join('\n');
}

function buildLoanAnalysis(loans = [], income) {
  if (!loans.length) return '  No active loans.';
  const totalEMI = loans.reduce((s, l) => s + (l.monthlyEMI || 0), 0);
  const lines = loans.map(l => {
    const remaining = l.remainingMonths ? `${l.remainingMonths} months left` : 'tenure unknown';
    const outstanding = l.outstandingBalance ? fmt(l.outstandingBalance) : 'unknown balance';
    return `  - ${l.loanType?.toUpperCase()} loan @ ${l.lenderName || 'Bank'}: EMI ${fmt(l.monthlyEMI)}/mo @ ${l.interestRate}% p.a. | ${outstanding} outstanding | ${remaining}`;
  });
  lines.push(`  TOTAL EMI BURDEN: ${fmt(totalEMI)}/mo (${income > 0 ? ((totalEMI / income) * 100).toFixed(1) : '?'}% of income)`);
  return lines.join('\n');
}

function buildGoalAnalysis(goals = []) {
  const active = goals.filter(g => g.status === 'active');
  if (!active.length) return '  No active financial goals set.';
  return active.map(g => {
    const progress = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : 0;
    const deadline = g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'No deadline';
    return `  - "${g.title}" (${g.category}): ${fmt(g.currentAmount)} saved of ${fmt(g.targetAmount)} target | ${progress}% done | Deadline: ${deadline} | Priority: ${g.priority}`;
  }).join('\n');
}

function buildNetWorthAnalysis(netWorth) {
  if (!netWorth) return '  Not provided.';
  const ratio = netWorth.totalLiabilities > 0
    ? (netWorth.totalAssets / netWorth.totalLiabilities).toFixed(2)
    : 'N/A';

  const assetLines = (netWorth.assets || []).map(a =>
    `    • ${a.name} (${a.category}): ${fmt(a.currentValue)}`
  ).join('\n') || '    • No assets listed';

  const liabLines = (netWorth.liabilities || []).map(l =>
    `    • ${l.name} (${l.category}): ${fmt(l.outstandingAmount)} @ ${l.interestRate || 0}%`
  ).join('\n') || '    • No liabilities listed';

  return `  Total Assets: ${fmt(netWorth.totalAssets)}
  Total Liabilities: ${fmt(netWorth.totalLiabilities)}
  Net Worth: ${fmt(netWorth.netWorth)}
  Asset-to-Liability Ratio: ${ratio}
  Assets breakdown:
${assetLines}
  Liabilities breakdown:
${liabLines}`;
}

function buildCreditCardAnalysis(creditCards = []) {
  if (!creditCards.length) return '  No credit cards.';
  const totalLimit = creditCards.reduce((s, c) => s + (c.creditLimit || 0), 0);
  const totalBal = creditCards.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
  const util = totalLimit > 0 ? ((totalBal / totalLimit) * 100).toFixed(1) : 0;
  const lines = creditCards.map(c => {
    const cardUtil = c.creditLimit > 0 ? ((c.outstandingBalance / c.creditLimit) * 100).toFixed(1) : 0;
    return `  - ${c.cardName}: ${fmt(c.outstandingBalance)} used of ${fmt(c.creditLimit)} limit (${cardUtil}% utilized)`;
  });
  lines.push(`  OVERALL UTILIZATION: ${util}%`);
  return lines.join('\n');
}

// ─── Main Prompt Builder ──────────────────────────────────────────────────────

function buildPrompt({ user, score, profile, goals, netWorth }) {
  const metrics    = score?.metrics     ?? score ?? {};
  const components = score?.components  ?? {};
  const expenses   = profile?.expenses  ?? {};
  const loans      = profile?.loans     ?? [];
  const cards      = profile?.creditCards ?? [];
  const income     = metrics.monthlyIncome || 0;

  // Flatten score fields if stored flat (Prisma) vs nested (Mongoose)
  const dtiScore        = components.dtiScore        ?? score?.dtiScore        ?? 0;
  const savingsScore    = components.savingsScore    ?? score?.savingsScore    ?? 0;
  const emergencyScore  = components.emergencyScore  ?? score?.emergencyScore  ?? 0;
  const creditScore     = components.creditScore     ?? score?.creditScore     ?? 0;
  const expenseScore    = components.expenseScore    ?? score?.expenseScore    ?? 0;

  const monthlyIncome       = income;
  const totalMonthlyEMI     = metrics.totalMonthlyEMI     ?? 0;
  const totalMonthlyExp     = metrics.totalMonthlyExpenses ?? 0;
  const savingsRate         = metrics.savingsRate          ?? 0;
  const dtiRatio            = metrics.dtiRatio             ?? 0;
  const creditUtil          = metrics.creditUtilization    ?? 0;
  const emergencyMonths     = metrics.emergencyFundMonths  ?? 0;
  const emergencyFundAmount = profile?.emergencyFundAmount ?? 0;
  const monthlySavings      = profile?.monthlySavings      ?? 0;
  const totalScore          = score?.totalScore            ?? 0;
  const grade               = score?.grade                 ?? 'N/A';

  const disposableIncome = monthlyIncome - totalMonthlyEMI - totalMonthlyExp;
  const annualIncome = monthlyIncome * 12;
  const tax80CLimitUsed = Math.min(annualIncome * 0.1, 150000); // rough estimate

  return `You are India's top certified financial planner (CFP) with 20 years of experience advising Indian salaried and self-employed professionals. You have deep expertise in Indian tax laws, mutual funds, SEBI regulations, and behavioral finance.

TASK: Analyse this person's complete financial data and generate exactly 7 highly personalized, deeply actionable recommendations. Each recommendation must reference their ACTUAL numbers — not generic advice.

═══════════════════════════════════════════════
COMPLETE FINANCIAL PROFILE
═══════════════════════════════════════════════

PERSONAL
  Name: ${user?.name ?? 'User'}
  Employment: ${user?.role === 'business' ? 'Self-employed / Business owner' : 'Salaried professional'}

FINANCIAL HEALTH SCORE: ${totalScore}/100 (Grade: ${grade})
${gradeContext(totalScore)}

COMPONENT SCORES (each out of 100):
  Debt-to-Income:   ${dtiScore}/100  → ${scoreLabel(dtiScore)}
  Savings Rate:     ${savingsScore}/100  → ${scoreLabel(savingsScore)}
  Emergency Fund:   ${emergencyScore}/100  → ${scoreLabel(emergencyScore)}
  Credit Health:    ${creditScore}/100  → ${scoreLabel(creditScore)}
  Expense Control:  ${expenseScore}/100  → ${scoreLabel(expenseScore)}

KEY FINANCIAL METRICS:
  Monthly income:         ${fmt(monthlyIncome)}
  Annual income:          ${fmt(annualIncome)}
  Monthly savings:        ${fmt(monthlySavings)} (${pct(savingsRate)} savings rate)
  Monthly EMI total:      ${fmt(totalMonthlyEMI)} (${pct(dtiRatio)} of income)
  Monthly expenses:       ${fmt(totalMonthlyExp)}
  Disposable income:      ${fmt(disposableIncome)} (after EMI + expenses)
  Emergency fund:         ${fmt(emergencyFundAmount)} (covers ${emergencyMonths.toFixed(1)} months)
  Credit utilization:     ${pct(creditUtil)}

MONTHLY EXPENSE BREAKDOWN:
${buildExpenseAnalysis(expenses, monthlyIncome)}

LOANS & EMI OBLIGATIONS:
${buildLoanAnalysis(loans, monthlyIncome)}

CREDIT CARDS:
${buildCreditCardAnalysis(cards)}

FINANCIAL GOALS:
${buildGoalAnalysis(goals)}

NET WORTH:
${buildNetWorthAnalysis(netWorth)}

═══════════════════════════════════════════════
RECOMMENDATION INSTRUCTIONS
═══════════════════════════════════════════════

Generate exactly 7 recommendations following these strict rules:

QUALITY RULES:
1. HYPER-SPECIFIC: Every recommendation MUST mention their actual rupee amounts, percentages, or ratios from the data above. No generic advice like "save more money."
2. IMMEDIATELY ACTIONABLE: Include the exact first step they can take TODAY or THIS WEEK. Name specific apps, banks, schemes, or platforms where relevant.
3. INDIA-SPECIFIC: Use relevant Indian instruments — PPF, ELSS, NPS (80CCD), RBI Bonds, Sovereign Gold Bonds, Liquid Funds, FD laddering, SCSS, etc.
4. NUMBERED IMPACT: Where possible, quantify the impact — "This will save you ₹X/month" or "This could grow to ₹X in Y years."
5. BEHAVIORAL: Address the psychological/behavioral aspect — why people avoid this and how to overcome it.
6. PRIORITIZED: First 3 must address the WEAKEST score components. Last 2 can be optimization/wealth-building.
7. CONCISE BUT RICH: Title max 10 words. Description 2-3 sentences max. Action step 1-2 sentences.

PRIORITY ASSIGNMENT RULES:
- "high": Score component < 50 OR dtiRatio > 50% OR emergencyMonths < 3 OR creditUtil > 50%
- "medium": Score component 50-74 OR metric needs improvement
- "low": Score component 75+ OR optimization/growth opportunity

CATEGORY OPTIONS: "savings" | "debt" | "emergency" | "credit" | "investment" | "expense" | "tax" | "insurance"

RESPOND WITH ONLY A VALID JSON ARRAY — no markdown, no explanation, no backticks:
[
  {
    "title": "Short punchy title max 10 words",
    "description": "2-3 sentences with specific numbers from their profile. Mention the actual impact.",
    "actionStep": "Exact first step to take today/this week. Name specific platform or scheme.",
    "priority": "high" | "medium" | "low",
    "category": "savings" | "debt" | "emergency" | "credit" | "investment" | "expense" | "tax" | "insurance",
    "impact": "One line quantifying the benefit e.g. 'Could free up ₹X/month' or 'Save ₹X in taxes annually'"
  }
]`;
}

// ─── API Call ─────────────────────────────────────────────────────────────────

export async function fetchGeminiRecommendations(financialContext) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini] REACT_APP_GEMINI_API_KEY not set — skipping AI recommendations.');
    return [];
  }

  const prompt = buildPrompt(financialContext);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,         // Lower = more precise, factual, consistent
        maxOutputTokens: 2048,    // Increased for richer descriptions
        topP: 0.85,
        topK: 40,
        responseMimeType: 'application/json', // Force JSON output
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();

  let recommendations;
  try {
    recommendations = JSON.parse(cleaned);
  } catch (e) {
    // Try extracting JSON array if surrounded by extra text
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      recommendations = JSON.parse(match[0]);
    } else {
      console.error('[Gemini] Failed to parse response:', cleaned);
      return [];
    }
  }

  if (!Array.isArray(recommendations)) return [];

  return recommendations.map((rec, i) => ({
    id:          `gemini-${i}-${Date.now()}`,
    _id:         `gemini-${i}-${Date.now()}`,
    title:       rec.title       ?? 'Recommendation',
    description: rec.description ?? '',
    actionStep:  rec.actionStep  ?? rec.action ?? '',
    impact:      rec.impact      ?? '',
    priority:    rec.priority    ?? 'medium',
    category:    rec.category    ?? 'savings',
    source:      'gemini',
    isRead:      false,
    isDismissed: false,
  }));
}