import React from 'react';
import { getPriorityStyle } from '../../utils/currency';
import api from '../../services/api';

const categoryIcons = {
  debt: '🏦',
  savings: '💰',
  emergency: '🛡️',
  credit: '💳',
  expenses: '🧾',
  income: '💵',
  investment: '📈'
};

const RecommendationCard = ({ rec, onDismiss }) => {
  const pStyle = getPriorityStyle(rec.priority);
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.icon}>{categoryIcons[rec.category] || '💡'}</span>
        <div style={styles.headerContent}>
          <div style={styles.title}>{rec.title}</div>
          <span style={{ ...styles.badge, background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>
            {rec.priority} priority
          </span>
        </div>
        <button onClick={() => onDismiss(rec._id)} style={styles.dismiss} title="Dismiss">×</button>
      </div>
      <p style={styles.description}>{rec.description}</p>
      {rec.actionStep && (
        <div style={styles.actionStep}>
          <span style={styles.actionLabel}>→ Action</span>
          <span style={styles.actionText}>{rec.actionStep}</span>
        </div>
      )}
    </div>
  );
};

const RecommendationPanel = ({ recommendations, loading, onRefresh }) => {
  const handleDismiss = async (id) => {
    try {
      await api.patch(`/recommendations/${id}/dismiss`);
      onRefresh?.();
    } catch (err) {
      console.error('Dismiss failed', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 80, background: 'var(--bg-elevated)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <div style={styles.emptyTitle}>No recommendations right now</div>
        <div style={styles.emptySubtitle}>Your financial health looks good! Keep it up.</div>
      </div>
    );
  }

  // Sort high > medium > low
  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div style={styles.list}>
      {sorted.map((rec) => (
        <RecommendationCard key={rec._id} rec={rec} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '16px',
    transition: 'border-color 0.2s'
  },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  icon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  headerContent: { flex: 1 },
  title: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.3 },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  dismiss: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px', flexShrink: 0 },
  description: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 },
  actionStep: { background: 'rgba(245, 166, 35, 0.07)', borderLeft: '2px solid var(--accent-gold)', padding: '8px 12px', borderRadius: '0 6px 6px 0' },
  actionLabel: { fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 3 },
  actionText: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 },
  empty: { textAlign: 'center', padding: '32px 20px' },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: 'var(--text-muted)' }
};

export default RecommendationPanel;
