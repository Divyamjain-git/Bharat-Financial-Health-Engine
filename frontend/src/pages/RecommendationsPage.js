import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLatestScore, fetchRecommendations, fetchAIRecommendations } from '../store/slices/scoreSlice';
import { fetchProfile } from '../store/slices/profileSlice';
import { fetchGoals } from '../store/slices/goalsSlice';
import { fetchNetWorth } from '../store/slices/netWorthSlice';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  debt:       { label: 'Debt',       icon: '💳', color: '#F05252', dim: 'rgba(240,82,82,0.12)' },
  savings:    { label: 'Savings',    icon: '🏦', color: '#F0B429', dim: 'rgba(240,180,41,0.12)' },
  emergency:  { label: 'Emergency',  icon: '🛡️', color: '#4F8EF7', dim: 'rgba(79,142,247,0.12)' },
  credit:     { label: 'Credit',     icon: '📊', color: '#9061F9', dim: 'rgba(144,97,249,0.12)' },
  investment: { label: 'Investment', icon: '📈', color: '#0DCFAA', dim: 'rgba(13,207,170,0.12)' },
  expense:    { label: 'Expense',    icon: '🧾', color: '#FF8A4C', dim: 'rgba(255,138,76,0.12)' },
  tax:        { label: 'Tax',        icon: '🏛️', color: '#31C48D', dim: 'rgba(49,196,141,0.12)' },
  insurance:  { label: 'Insurance',  icon: '🔒', color: '#8B5CF6', dim: 'rgba(139,92,246,0.12)' },
  goal:       { label: 'Goal',       icon: '🎯', color: '#F59E0B', dim: 'rgba(245,158,11,0.12)' },
};

const PRIORITY_META = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  high:     { label: 'High',     color: '#F0B429', bg: 'rgba(240,180,41,0.12)', border: 'rgba(240,180,41,0.3)' },
  medium:   { label: 'Medium',   color: '#4F8EF7', bg: 'rgba(79,142,247,0.12)', border: 'rgba(79,142,247,0.3)' },
  low:      { label: 'Low',      color: '#31C48D', bg: 'rgba(49,196,141,0.12)', border: 'rgba(49,196,141,0.3)' },
};

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, grade }) {
  const color = grade === 'Excellent' ? '#0DCFAA' : grade === 'Good' ? '#31C48D' : grade === 'Fair' ? '#F0B429' : grade === 'Poor' ? '#FF8A4C' : '#F05252';
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.5 }}>{grade}</span>
      </div>
    </div>
  );
}

// ─── Component Meter ─────────────────────────────────────────────────────────
function ComponentMeter({ label, value, icon }) {
  const color = value >= 75 ? '#0DCFAA' : value >= 50 ? '#F0B429' : value >= 35 ? '#FF8A4C' : '#F05252';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}/100</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// ─── Metric Chip ─────────────────────────────────────────────────────────────
function MetricChip({ label, value, sub, color = 'var(--text)' }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecCard({ rec, index, isAI }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[rec.category] ?? CATEGORY_META.savings;
  const pri = PRIORITY_META[rec.priority] ?? PRIORITY_META.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${expanded ? pri.border : 'var(--border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Category Icon */}
        <div style={{ width: 42, height: 42, borderRadius: 11, background: cat.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {cat.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            {/* Priority badge */}
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: pri.color, background: pri.bg, border: `1px solid ${pri.border}`, borderRadius: 5, padding: '2px 7px' }}>
              {pri.label}
            </span>
            {/* Category badge */}
            <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, background: cat.dim, borderRadius: 5, padding: '2px 7px' }}>
              {cat.label}
            </span>
            {/* AI badge */}
            {isAI && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9061F9', background: 'rgba(144,97,249,0.12)', borderRadius: 5, padding: '2px 7px' }}>
                ✨ AI
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
            {rec.title}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {rec.description}
          </p>
          {/* Impact pill */}
          {rec.impact && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(13,207,170,0.1)', border: '1px solid rgba(13,207,170,0.2)', borderRadius: 6, padding: '4px 10px' }}>
              <span style={{ fontSize: 12, color: '#0DCFAA', fontWeight: 700 }}>💰 {rec.impact}</span>
            </div>
          )}
        </div>

        {/* Expand arrow */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} style={{ color: 'var(--text-3)', fontSize: 16, flexShrink: 0, marginTop: 4 }}>▾</motion.div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid var(--border)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Action Step */}
              {rec.actionStep && (
                <div style={{ background: 'rgba(240,180,41,0.07)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>⚡ Action Step (do this week)</div>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{rec.actionStep}</p>
                </div>
              )}

              {/* Calculation */}
              {rec.calculation && (
                <div style={{ background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>🔢 The Math</div>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontFamily: 'monospace' }}>{rec.calculation}</p>
                </div>
              )}

              {/* Why People Avoid */}
              {rec.whyPeopleAvoid && (
                <div style={{ background: 'rgba(144,97,249,0.07)', border: '1px solid rgba(144,97,249,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>🧠 Why People Avoid This</div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{rec.whyPeopleAvoid}</p>
                </div>
              )}

              {/* Action Step for rule-based (no whyPeopleAvoid) */}
              {rec.actionStep && !rec.whyPeopleAvoid && !rec.calculation && (
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                  Click "Update Profile" to recalculate after taking action.
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { profile, loans } = useSelector(s => s.profile);
  const { latest: score, recommendations, aiRecommendations, aiLoading } = useSelector(s => s.score);
  const { goals } = useSelector(s => s.goals);
  const { data: nwData } = useSelector(s => s.netWorth);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSource, setActiveSource] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchLatestScore());
    dispatch(fetchRecommendations());
    dispatch(fetchProfile());
    dispatch(fetchGoals());
    dispatch(fetchNetWorth());
  }, [dispatch]);

  useEffect(() => {
    if (score && profile) {
      dispatch(fetchAIRecommendations({ user, score, profile: { ...profile, loans }, goals, netWorth: nwData }));
    }
  }, [score?.totalScore, profile?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchLatestScore()), dispatch(fetchRecommendations())]);
    if (score && profile) {
      await dispatch(fetchAIRecommendations({ user, score, profile: { ...profile, loans }, goals, netWorth: nwData }));
    }
    setRefreshing(false);
  };

  // Merge + dedupe all recommendations
  const allRecs = useMemo(() => {
    const ruleRecs = (recommendations || []).map(r => ({ ...r, source: 'rule' }));
    const aiRecs   = (aiRecommendations || []).map(r => ({ ...r, source: 'gemini' }));
    return [...aiRecs, ...ruleRecs];
  }, [recommendations, aiRecommendations]);

  // Filter
  const filtered = useMemo(() => {
    return allRecs.filter(r => {
      if (activeFilter !== 'all' && r.category !== activeFilter) return false;
      if (activeSource !== 'all' && r.source !== activeSource) return false;
      if (activePriority !== 'all' && r.priority !== activePriority) return false;
      return true;
    });
  }, [allRecs, activeFilter, activeSource, activePriority]);

  // Stats
  const metrics  = score?.metrics     ?? score ?? {};
  const comps    = score?.components  ?? {};
  const dtiScore       = comps.dtiScore       ?? score?.dtiScore       ?? 0;
  const savingsScore   = comps.savingsScore   ?? score?.savingsScore   ?? 0;
  const emergencyScore = comps.emergencyScore ?? score?.emergencyScore ?? 0;
  const creditScore    = comps.creditScore    ?? score?.creditScore    ?? 0;
  const expenseScore   = comps.expenseScore   ?? score?.expenseScore   ?? 0;

  const income       = metrics.monthlyIncome        ?? 0;
  const totalEMI     = metrics.totalMonthlyEMI      ?? 0;
  const totalExp     = metrics.totalMonthlyExpenses ?? 0;
  const savingsRate  = metrics.savingsRate           ?? 0;
  const dtiRatio     = metrics.dtiRatio              ?? 0;
  const creditUtil   = metrics.creditUtilization     ?? 0;
  const emergencyMos = metrics.emergencyFundMonths   ?? 0;
  const disposable   = income - totalEMI - totalExp;

  const criticalCount = allRecs.filter(r => r.priority === 'critical' || r.priority === 'high').length;
  const categories = [...new Set(allRecs.map(r => r.category))];

  const S = {
    page: { padding: '28px 28px 60px', maxWidth: 1100, margin: '0 auto' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 },
    title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, marginBottom: 4 },
    subtitle: { fontSize: 14, color: 'var(--text-2)' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 },
    sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', marginBottom: 14 },
    filterBar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
    filterBtn: (active, color = 'var(--gold)') => ({
      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
      background: active ? 'rgba(240,180,41,0.15)' : 'var(--bg-elevated)',
      color: active ? color : 'var(--text-2)',
      border: `1px solid ${active ? 'rgba(240,180,41,0.3)' : 'var(--border)'}`,
      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
    }),
    recList: { display: 'flex', flexDirection: 'column', gap: 12 },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>✨ AI Recommendations</h1>
          <p style={S.subtitle}>
            {allRecs.length} personalized insights · {criticalCount} need immediate attention
            {aiLoading && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>· Gemini analysing...</span>}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing || aiLoading} className="btn btn-secondary btn-sm">
          {refreshing ? <><span className="spinner" />Refreshing...</> : '↻ Refresh'}
        </button>
      </div>

      {score && (
        <>
          {/* Score Overview */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={S.sectionTitle}>Financial Health Overview</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreRing score={score.totalScore ?? 0} grade={score.grade ?? 'N/A'} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
                <ComponentMeter label="Debt-to-Income"  value={dtiScore}       icon="💳" />
                <ComponentMeter label="Savings Rate"    value={savingsScore}   icon="🏦" />
                <ComponentMeter label="Emergency Fund"  value={emergencyScore} icon="🛡️" />
                <ComponentMeter label="Credit Health"   value={creditScore}    icon="📊" />
                <ComponentMeter label="Expense Control" value={expenseScore}   icon="🧾" />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={S.grid4}>
            <MetricChip label="Monthly Income"    value={fmt(income)}      sub="gross monthly" />
            <MetricChip label="Disposable Income" value={fmt(disposable)}  sub="after EMI + expenses" color={disposable > 0 ? '#0DCFAA' : '#F05252'} />
            <MetricChip label="Debt-to-Income"    value={`${dtiRatio.toFixed(1)}%`} sub={dtiRatio > 40 ? '⚠️ Above safe limit' : '✅ Healthy'} color={dtiRatio > 40 ? '#F05252' : '#0DCFAA'} />
            <MetricChip label="Emergency Fund"    value={`${emergencyMos.toFixed(1)} mo`} sub={emergencyMos < 3 ? '⚠️ Below 3 months' : '✅ Good coverage'} color={emergencyMos < 3 ? '#FF8A4C' : '#0DCFAA'} />
            <MetricChip label="Savings Rate"      value={`${savingsRate.toFixed(1)}%`} sub={savingsRate < 20 ? '📈 Target: 20%' : '✅ On track'} color={savingsRate < 10 ? '#F05252' : savingsRate < 20 ? '#F0B429' : '#0DCFAA'} />
            <MetricChip label="Monthly EMI"       value={fmt(totalEMI)}    sub={`${dtiRatio.toFixed(1)}% of income`} />
            <MetricChip label="Monthly Expenses"  value={fmt(totalExp)}    sub={`${income > 0 ? ((totalExp/income)*100).toFixed(1) : 0}% of income`} />
            <MetricChip label="Credit Utilization" value={`${creditUtil.toFixed(1)}%`} sub={creditUtil > 30 ? '⚠️ Above 30%' : '✅ Healthy'} color={creditUtil > 50 ? '#F05252' : creditUtil > 30 ? '#F0B429' : '#0DCFAA'} />
          </div>

          {/* Critical Alerts Banner */}
          {criticalCount > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 800, color: '#EF4444', fontSize: 14, marginBottom: 2 }}>
                  {criticalCount} High-Priority Issue{criticalCount > 1 ? 's' : ''} Detected
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Address these first — they have the biggest impact on your financial health.
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Filters */}
      <div style={{ ...S.card, marginBottom: 20, padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Source filter */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Source</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all','All'],['gemini','✨ AI'],['rule','Rule-based']].map(([v, l]) => (
                <button key={v} style={S.filterBtn(activeSource === v)} onClick={() => setActiveSource(v)}>{l}</button>
              ))}
            </div>
          </div>
          {/* Priority filter */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Priority</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all','All'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']].map(([v, l]) => (
                <button key={v} style={S.filterBtn(activePriority === v, PRIORITY_META[v]?.color)} onClick={() => setActivePriority(v)}>{l}</button>
              ))}
            </div>
          </div>
          {/* Category filter */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={S.filterBtn(activeFilter === 'all')} onClick={() => setActiveFilter('all')}>All</button>
              {categories.map(cat => (
                <button key={cat} style={S.filterBtn(activeFilter === cat, CATEGORY_META[cat]?.color)}
                  onClick={() => setActiveFilter(cat)}>
                  {CATEGORY_META[cat]?.icon} {CATEGORY_META[cat]?.label ?? cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Showing {filtered.length} of {allRecs.length} recommendations
        </span>
        {(activeFilter !== 'all' || activeSource !== 'all' || activePriority !== 'all') && (
          <button style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            onClick={() => { setActiveFilter('all'); setActiveSource('all'); setActivePriority('all'); }}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* AI Loading skeleton */}
      {aiLoading && (
        <div style={{ ...S.card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="spinner" style={{ width: 20, height: 20 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Gemini is analysing your finances...</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Generating personalised AI recommendations with calculations</div>
          </div>
        </div>
      )}

      {/* Recommendation List */}
      {filtered.length === 0 && !aiLoading ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No recommendations match your filters</div>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Try changing your filters or complete your financial profile for personalised advice.</div>
        </div>
      ) : (
        <div style={S.recList}>
          {/* AI Section */}
          {(activeSource === 'all' || activeSource === 'gemini') && aiRecommendations.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 4px' }}>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#9061F9', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  ✨ AI-Powered ({aiRecommendations.filter(r =>
                    (activeFilter === 'all' || r.category === activeFilter) &&
                    (activePriority === 'all' || r.priority === activePriority)
                  ).length})
                </span>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
              </div>
              {aiRecommendations
                .filter(r => (activeFilter === 'all' || r.category === activeFilter) && (activePriority === 'all' || r.priority === activePriority))
                .map((rec, i) => <RecCard key={rec.id || i} rec={rec} index={i} isAI />)}
            </>
          )}

          {/* Rule-based Section */}
          {(activeSource === 'all' || activeSource === 'rule') && recommendations.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 4px' }}>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  Rule-based ({recommendations.filter(r =>
                    (activeFilter === 'all' || r.category === activeFilter) &&
                    (activePriority === 'all' || r.priority === activePriority)
                  ).length})
                </span>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
              </div>
              {recommendations
                .filter(r => (activeFilter === 'all' || r.category === activeFilter) && (activePriority === 'all' || r.priority === activePriority))
                .map((rec, i) => <RecCard key={rec.id || rec._id || i} rec={rec} index={i} isAI={false} />)}
            </>
          )}
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 32, padding: '14px 18px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-2)' }}>Disclaimer:</strong> These recommendations are generated by AI and rule-based algorithms based on your financial data. They are for informational purposes only and do not constitute professional financial advice. Please consult a SEBI-registered financial advisor before making major financial decisions.
        </p>
      </div>
    </div>
  );
}