/**
 * Gemini AI Service — Elite Personalised Financial Recommendations + Chat
 * All API calls are proxied through the backend to keep API keys secure.
 * Prompt-building logic stays client-side (uses only user's own data).
 */

import api from './api';

const fmt  = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : 'N/A';
const pct  = (n) => n != null ? `${Number(n).toFixed(1)}%` : 'N/A';
const slab = (s) => s >= 80 ? '✅ Excellent' : s >= 65 ? '🟡 Good' : s >= 50 ? '🟠 Fair' : s >= 35 ? '🔴 Weak' : '🚨 Critical';

function buildExpenseBreakdown(expenses = {}, income) {
  const entries = Object.entries(expenses).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '  (no expense data)';
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const lines = entries.map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    const share = income > 0 ? ((v / income) * 100).toFixed(1) : '?';
    return `    • ${label}: ${fmt(v)}/mo  [${share}% of income]`;
  });
  lines.push(`    ─ TOTAL: ${fmt(total)}/mo  [${income > 0 ? ((total / income) * 100).toFixed(1) : '?'}% of income]`);
  return lines.join('\n');
}

function buildLoanBreakdown(loans = [], income) {
  if (!loans.length) return '  No active loans.';
  const totalEMI = loans.reduce((s, l) => s + (l.monthlyEMI || 0), 0);
  const lines = loans.map(l => {
    const months = l.remainingMonths ? `${l.remainingMonths}mo remaining` : 'tenure unknown';
    const totalInterest = l.remainingMonths
      ? Math.round(l.monthlyEMI * l.remainingMonths - (l.outstandingBalance || 0))
      : null;
    return [
      `    • ${(l.loanType || 'loan').toUpperCase()} @ ${l.lenderName || 'Bank'}`,
      `      EMI: ${fmt(l.monthlyEMI)}/mo | Rate: ${l.interestRate}% p.a. | Outstanding: ${fmt(l.outstandingBalance)} | ${months}`,
      totalInterest != null && totalInterest > 0 ? `      Total interest still to pay: ${fmt(totalInterest)}` : ''
    ].filter(Boolean).join('\n');
  });
  lines.push(`    ─ TOTAL EMI: ${fmt(totalEMI)}/mo  [${income > 0 ? ((totalEMI / income) * 100).toFixed(1) : '?'}% of income]`);
  return lines.join('\n');
}

function buildCreditCards(cards = []) {
  if (!cards.length) return '  No credit cards.';
  const totalLimit = cards.reduce((s, c) => s + (c.creditLimit || 0), 0);
  const totalBal   = cards.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
  const util = totalLimit > 0 ? ((totalBal / totalLimit) * 100).toFixed(1) : 0;
  const lines = cards.map(c => {
    const cardUtil = c.creditLimit > 0 ? ((c.outstandingBalance / c.creditLimit) * 100).toFixed(1) : 0;
    const annualInterest = c.outstandingBalance > 0 ? Math.round(c.outstandingBalance * 0.39) : 0;
    return `    • ${c.cardName}: ${fmt(c.outstandingBalance)} used / ${fmt(c.creditLimit)} limit (${cardUtil}% utilized)${annualInterest > 0 ? ` → costs ~${fmt(annualInterest)}/yr in interest if unpaid` : ''}`;
  });
  lines.push(`    ─ OVERALL UTILIZATION: ${util}%`);
  return lines.join('\n');
}

function buildGoals(goals = []) {
  const active = (goals || []).filter(g => g.status === 'active');
  if (!active.length) return '  No active goals.';
  return active.map(g => {
    const progress = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : 0;
    const remaining = (g.targetAmount || 0) - (g.currentAmount || 0);
    const deadline = g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'No deadline';
    const monthsLeft = g.targetDate ? Math.max(0, Math.round((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))) : null;
    const reqSIP = monthsLeft > 0 ? Math.round(remaining / monthsLeft) : null;
    return [
      `    • "${g.title}" [${g.category}] — ${g.priority} priority`,
      `      Saved: ${fmt(g.currentAmount)} of ${fmt(g.targetAmount)} (${progress}% done) | Remaining: ${fmt(remaining)}`,
      `      Deadline: ${deadline}${monthsLeft != null ? ` (${monthsLeft} months away)` : ''}${reqSIP != null ? ` | Needs: ${fmt(reqSIP)}/mo` : ''}`
    ].join('\n');
  }).join('\n');
}

function buildNetWorth(nw) {
  if (!nw) return '  Not provided.';
  const ratio = nw.totalLiabilities > 0 ? (nw.totalAssets / nw.totalLiabilities).toFixed(2) : '∞';
  const assetLines = (nw.assets || []).map(a => `      • ${a.name} [${a.category}]: ${fmt(a.currentValue)}`).join('\n') || '      (none listed)';
  const liabLines  = (nw.liabilities || []).map(l => `      • ${l.name} [${l.category}]: ${fmt(l.outstandingAmount)} @ ${l.interestRate || 0}%`).join('\n') || '      (none listed)';
  return `    Total Assets: ${fmt(nw.totalAssets)} | Liabilities: ${fmt(nw.totalLiabilities)} | Net Worth: ${fmt(nw.netWorth)} | Ratio: ${ratio}x\n    Assets:\n${assetLines}\n    Liabilities:\n${liabLines}`;
}

function buildPrompt({ user, score: sc, profile, goals, netWorth }) {
  const metrics    = sc?.metrics     ?? sc ?? {};
  const components = sc?.components  ?? {};
  const expenses   = profile?.expenses  ?? {};
  const loans      = profile?.loans     ?? [];
  const cards      = profile?.creditCards ?? [];

  const dtiScore       = components.dtiScore       ?? sc?.dtiScore       ?? 0;
  const savingsScore   = components.savingsScore   ?? sc?.savingsScore   ?? 0;
  const emergencyScore = components.emergencyScore ?? sc?.emergencyScore ?? 0;
  const creditScore    = components.creditScore    ?? sc?.creditScore    ?? 0;
  const expenseScore   = components.expenseScore   ?? sc?.expenseScore   ?? 0;

  const income       = metrics.monthlyIncome        ?? 0;
  const totalEMI     = metrics.totalMonthlyEMI      ?? 0;
  const totalExp     = metrics.totalMonthlyExpenses ?? 0;
  const savingsRate  = metrics.savingsRate           ?? 0;
  const dtiRatio     = metrics.dtiRatio              ?? 0;
  const creditUtil   = metrics.creditUtilization     ?? 0;
  const emergencyMos = metrics.emergencyFundMonths   ?? 0;
  const totalScore   = sc?.totalScore                ?? 0;
  const grade        = sc?.grade                     ?? 'N/A';
  const disposable   = income - totalEMI - totalExp;
  const annualIncome = income * 12;
  const emergencyAmt = profile?.emergencyFundAmount  ?? 0;

  const weakest = [
    { name: 'Debt-to-Income',  s: dtiScore },
    { name: 'Savings Rate',    s: savingsScore },
    { name: 'Emergency Fund',  s: emergencyScore },
    { name: 'Credit Health',   s: creditScore },
    { name: 'Expense Control', s: expenseScore },
  ].sort((a, b) => a.s - b.s).slice(0, 3).map(c => `${c.name} (${c.s}/100)`).join(', ');

  const activeGoalCategories = (goals || []).filter(g => g.status === 'active').map(g => g.category).join(', ') || 'none';

  return `You are India's top-rated SEBI-registered financial planner with 25 years of experience advising Indian salaried and self-employed professionals. You have deep expertise in Indian mutual funds, CIBIL scores, tax laws (80C/80CCD/80D), and behavioral finance.

TASK: Analyse this person's COMPLETE financial snapshot and generate exactly 8 hyper-personalized recommendations. Every recommendation MUST cite their actual rupee figures — zero generic advice allowed.

══════════════════════════════════════
FINANCIAL SNAPSHOT — ${user?.name ?? 'User'} (${user?.role === 'business' ? 'Self-employed' : 'Salaried'})
══════════════════════════════════════

HEALTH SCORE: ${totalScore}/100 | Grade: ${grade}
TOP 3 WEAKEST AREAS (address first): ${weakest}

SCORES:
  Debt-to-Income:  ${dtiScore}/100 ${slab(dtiScore)}
  Savings Rate:    ${savingsScore}/100 ${slab(savingsScore)}
  Emergency Fund:  ${emergencyScore}/100 ${slab(emergencyScore)}
  Credit Health:   ${creditScore}/100 ${slab(creditScore)}
  Expense Control: ${expenseScore}/100 ${slab(expenseScore)}

CASHFLOW:
  Monthly income:    ${fmt(income)} (Annual: ${fmt(annualIncome)})
  Monthly EMIs:      ${fmt(totalEMI)} (${pct(dtiRatio)} DTI)
  Monthly expenses:  ${fmt(totalExp)} (${income > 0 ? ((totalExp/income)*100).toFixed(1) : '?'}% of income)
  Disposable:        ${fmt(disposable)} after all fixed costs
  Emergency fund:    ${fmt(emergencyAmt)} = ${emergencyMos.toFixed(1)} months coverage
  Credit util:       ${pct(creditUtil)}

EXPENSES:
${buildExpenseBreakdown(expenses, income)}

LOANS:
${buildLoanBreakdown(loans, income)}

CREDIT CARDS:
${buildCreditCards(cards)}

GOALS (active: ${activeGoalCategories}):
${buildGoals(goals)}

NET WORTH:
${buildNetWorth(netWorth)}

══════════════════════════════════════
RULES FOR EACH RECOMMENDATION:
══════════════════════════════════════
1. Quote their actual ₹ amounts (not generic placeholders).
2. Show real math in the "calculation" field.
3. First 3 recs = their 3 weakest areas above.
4. Use real Indian products: PPF, ELSS, NPS Tier-1, Sovereign Gold Bonds, Liquid Funds, FD laddering, Section 80C/80CCD/80D.
5. actionStep = doable within 7 days, name specific app/bank/scheme.
6. impact = single line with concrete ₹ or % benefit.
7. calculation = show the actual math (SIP growth, interest saved, tax saved, etc.)
8. whyPeopleAvoid = brief psychological barrier + one-line trick to overcome it.
9. projectedScoreImpact = integer 1-15 estimating how many points their health score would improve if they act on this rec.
10. timeToComplete = how long to set up: "15 min" | "1 hour" | "1 day" | "1 week" | "ongoing".
11. linkedGoalCategory = if this rec directly helps an active goal, put its category (e.g. "home", "retirement", "education"), otherwise null.

PRIORITY:
  "critical" → score < 35 OR dtiRatio > 60% OR emergencyMos < 1 OR creditUtil > 75%
  "high"     → score < 50 OR dtiRatio > 40% OR emergencyMos < 3 OR creditUtil > 50%
  "medium"   → score 50–74
  "low"      → score 75+ or optimization

OUTPUT: ONLY a raw JSON array, no markdown, no backticks, no explanation:
[
  {
    "title": "Max 10-word punchy title",
    "description": "2–3 sentences with their actual numbers and why it matters.",
    "actionStep": "Exact step doable in 7 days. Name real platform/bank/scheme + amount.",
    "calculation": "Show the actual math. E.g: ₹5,000/mo SIP × 12 = ₹60,000/yr | At 12% CAGR for 10 years = ₹11,61,695",
    "impact": "Single line quantifying the benefit. E.g: Save ₹46,800 in taxes this year",
    "whyPeopleAvoid": "One sentence on the barrier + trick to start anyway.",
    "priority": "critical | high | medium | low",
    "category": "debt | savings | emergency | credit | investment | expense | tax | insurance | goal",
    "projectedScoreImpact": 8,
    "timeToComplete": "15 min",
    "linkedGoalCategory": "home | retirement | education | travel | emergency | other | null"
  }
]`;
}

// ─── Fetch Recommendations (via backend proxy) ───────────────────────────────
export async function fetchGeminiRecommendations(financialContext) {
  try {
    const prompt = buildPrompt(financialContext);
    const response = await api.post('/ai/recommendations', { prompt });
    return response.data.data || [];
  } catch (err) {
    console.warn('[Gemini] Failed to fetch recommendations:', err.message);
    return [];
  }
}

// ─── AI Chat (via backend proxy) ─────────────────────────────────────────────
/**
 * Send a follow-up chat message via the backend AI proxy.
 * @param {string} message - The user's question
 * @param {object} financialContext - { user, score, profile, goals, netWorth }
 * @param {Array<{role: 'user'|'ai', content: string}>} history - Conversation history
 * @returns {Promise<string>} - AI response text
 */
export async function fetchGeminiChat(message, financialContext, history = []) {
  const { score: sc, profile, goals } = financialContext || {};
  const metrics    = sc?.metrics ?? sc ?? {};
  const income     = metrics.monthlyIncome ?? 0;
  const totalEMI   = metrics.totalMonthlyEMI ?? 0;
  const totalExp   = metrics.totalMonthlyExpenses ?? 0;
  const savingsRate = metrics.savingsRate ?? 0;
  const dtiRatio   = metrics.dtiRatio ?? 0;
  const creditUtil = metrics.creditUtilization ?? 0;
  const emergencyMos = metrics.emergencyFundMonths ?? 0;
  const totalScore = sc?.totalScore ?? 0;
  const grade      = sc?.grade ?? 'N/A';
  const disposable = income - totalEMI - totalExp;
  const loans      = profile?.loans ?? [];
  const activeGoals = (goals || []).filter(g => g.status === 'active');

  const contextSummary = `User's Financial Snapshot:
- Health Score: ${totalScore}/100 (${grade})
- Monthly Income: ${fmt(income)} | EMIs: ${fmt(totalEMI)} (DTI: ${pct(dtiRatio)})
- Monthly Expenses: ${fmt(totalExp)} | Disposable: ${fmt(disposable)}
- Savings Rate: ${pct(savingsRate)} | Emergency Fund: ${emergencyMos.toFixed(1)} months
- Credit Utilization: ${pct(creditUtil)}
- Active Loans: ${loans.length > 0 ? loans.map(l => `${l.loanType || 'Loan'} @ ${l.interestRate}% (EMI: ${fmt(l.monthlyEMI)})`).join(', ') : 'None'}
- Active Goals: ${activeGoals.length > 0 ? activeGoals.map(g => `"${g.title}" — ${Math.round((g.currentAmount / g.targetAmount) * 100)}% done`).join(', ') : 'None'}`;

  const systemTurn = `You are Bharat's smartest SEBI-registered financial advisor. You have the user's real financial data below. Answer questions using their actual ₹ numbers. Be concise (max 120 words), practical, warm, and India-specific. Reference specific apps/banks/schemes by name. Format key numbers clearly.\n\n${contextSummary}`;

  const messages = [
    { role: 'system', content: systemTurn },
    { role: 'assistant', content: `Got it — I have your complete financial profile. I can see your score is ${totalScore}/100 with ${fmt(income)} monthly income and ${fmt(disposable)} in disposable income. Ask me anything about your finances!` },
    ...history.map(h => ({
      role: h.role === 'ai' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const response = await api.post('/ai/chat', { messages });
    return response.data.data.reply;
  } catch (err) {
    console.error('[AI Chat] Error:', err.message);
    return "Sorry, I couldn't connect to the AI right now. Please try again.";
  }
}