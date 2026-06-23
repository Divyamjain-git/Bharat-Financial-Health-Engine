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
    className="glass-card"
    style={{
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Background glow */}
    <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: color + '15', filter: 'blur(24px)', pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</div>
      {icon && <div style={{ fontSize: 18, opacity: 0.9, color }}>{icon}</div>}
    </div>
    <div className="dash-stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 6, position: 'relative', letterSpacing: -0.5 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', position: 'relative' }}>{sub}</div>}
    {trend !== undefined && (
      <div style={{ fontSize: 12, fontWeight: 800, color: trend >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 6 }}>
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs last month
      </div>
    )}
  </motion.div>
);

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'var(--gold)', height = 6, animated = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: height / 2, overflow: 'hidden' }}>
      <motion.div
        initial={animated ? { width: 0 } : { width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: '100%', background: color, borderRadius: height / 2, boxShadow: `0 0 10px ${color}66` }}
      />
    </div>
  );
};

// ── SectionCard ───────────────────────────────────────────────────────────────
export const SectionCard = ({ title, subtitle, action, children, style = {} }) => (
  <div className="glass-card" style={{ ...style }}>
    {(title || action) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 6 : 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</div>
        {action && <div>{action}</div>}
      </div>
    )}
    {subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{subtitle}</div>}
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
