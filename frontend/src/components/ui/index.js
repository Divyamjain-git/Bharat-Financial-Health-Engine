import React from 'react';
import { motion } from 'framer-motion';

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-display)' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, color = 'var(--gold)', icon, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}22`,
      borderRadius: 'var(--r-lg)',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Background glow */}
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10', filter: 'blur(20px)', pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      {icon && <div style={{ fontSize: 18, opacity: 0.7 }}>{icon}</div>}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color, lineHeight: 1, marginBottom: 4, position: 'relative' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-2)', position: 'relative' }}>{sub}</div>}
    {trend !== undefined && (
      <div style={{ fontSize: 12, fontWeight: 700, color: trend >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs last month
      </div>
    )}
  </motion.div>
);

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'var(--gold)', height = 6, animated = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height, background: 'var(--bg-elevated)', borderRadius: height / 2, overflow: 'hidden' }}>
      <motion.div
        initial={animated ? { width: 0 } : { width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: '100%', background: color, borderRadius: height / 2 }}
      />
    </div>
  );
};

// ── SectionCard ───────────────────────────────────────────────────────────────
export const SectionCard = ({ title, subtitle, action, children, style = {} }) => (
  <div className="card" style={{ ...style }}>
    {(title || action) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 4 : 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
        {action && <div>{action}</div>}
      </div>
    )}
    {subtitle && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{subtitle}</div>}
    {children}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>{subtitle}</div>
    {action}
  </div>
);

// ── LoadingGrid ───────────────────────────────────────────────────────────────
export const LoadingGrid = ({ count = 4, height = 80 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
    {Array(count).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height, borderRadius: 'var(--r-lg)' }} />)}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const map = { high: 'badge-red', medium: 'badge-gold', low: 'badge-teal' };
  return <span className={`badge ${map[priority] || 'badge-blue'}`}>{priority}</span>;
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style = {} }) => (
  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0', ...style }} />
);

// ── Tooltip-styled info box ───────────────────────────────────────────────────
export const InfoBox = ({ children, type = 'info' }) => {
  const colors = { info: ['var(--blue-dim)', 'var(--blue)'], warn: ['var(--gold-dim)', 'var(--gold)'], success: ['var(--green-dim)', 'var(--green)'] };
  const [bg, border] = colors[type] || colors.info;
  return (
    <div style={{ background: bg, border: `1px solid ${border}33`, borderRadius: 9, padding: '10px 14px', fontSize: 13, color: 'var(--text-2)' }}>
      {children}
    </div>
  );
};
