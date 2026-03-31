import React from 'react';
import { formatINR } from '../../utils/currency';

const MetricCard = ({ label, value, subtitle, color, icon, trend }) => (
  <div style={{ ...styles.card, borderColor: color + '25' }}>
    <div style={{ ...styles.iconBox, background: color + '15', color }}>{icon}</div>
    <div style={styles.content}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color }}>{value}</div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
    </div>
    {trend && (
      <div style={{ ...styles.trend, color: trend > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const MetricCards = ({ metrics, components, loading }) => {
  if (loading) {
    return (
      <div style={styles.grid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...styles.card, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ height: 60, background: 'var(--bg-card)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const getDtiStatus = (dti) => {
    if (dti < 20) return { label: 'Healthy', color: 'var(--score-excellent)' };
    if (dti < 35) return { label: 'Moderate', color: 'var(--score-good)' };
    if (dti < 50) return { label: 'High', color: 'var(--score-fair)' };
    return { label: 'Critical', color: 'var(--score-critical)' };
  };

  const getSavingsStatus = (rate) => {
    if (rate >= 30) return { label: 'Excellent', color: 'var(--score-excellent)' };
    if (rate >= 20) return { label: 'Good', color: 'var(--score-good)' };
    if (rate >= 10) return { label: 'Fair', color: 'var(--score-fair)' };
    return { label: 'Low', color: 'var(--score-critical)' };
  };

  const getCreditStatus = (util) => {
    if (util < 10) return { label: 'Excellent', color: 'var(--score-excellent)' };
    if (util < 30) return { label: 'Good', color: 'var(--score-good)' };
    if (util < 50) return { label: 'Fair', color: 'var(--score-fair)' };
    return { label: 'High Risk', color: 'var(--score-critical)' };
  };

  const getEmergencyStatus = (months) => {
    if (months >= 6) return { label: '6+ months', color: 'var(--score-excellent)' };
    if (months >= 3) return { label: `${months.toFixed(1)} months`, color: 'var(--score-good)' };
    if (months >= 1) return { label: `${months.toFixed(1)} months`, color: 'var(--score-fair)' };
    return { label: 'Critical', color: 'var(--score-critical)' };
  };

  const dti = getDtiStatus(metrics.dtiRatio);
  const savings = getSavingsStatus(metrics.savingsRate);
  const credit = getCreditStatus(metrics.creditUtilization);
  const emergency = getEmergencyStatus(metrics.emergencyFundMonths);

  const cards = [
    {
      label: 'Debt-to-Income Ratio',
      value: `${metrics.dtiRatio?.toFixed(1)}%`,
      subtitle: dti.label,
      color: dti.color,
      icon: '📊'
    },
    {
      label: 'Savings Rate',
      value: `${metrics.savingsRate?.toFixed(1)}%`,
      subtitle: savings.label,
      color: savings.color,
      icon: '💰'
    },
    {
      label: 'Credit Utilization',
      value: `${metrics.creditUtilization?.toFixed(1)}%`,
      subtitle: credit.label,
      color: credit.color,
      icon: '💳'
    },
    {
      label: 'Emergency Fund',
      value: emergency.label,
      subtitle: formatINR(metrics.monthlyIncome * metrics.emergencyFundMonths),
      color: emergency.color,
      icon: '🛡️'
    },
    {
      label: 'Monthly Income',
      value: formatINR(metrics.monthlyIncome),
      subtitle: 'After tax',
      color: 'var(--accent-teal)',
      icon: '💵'
    },
    {
      label: 'Total EMI Outgo',
      value: formatINR(metrics.totalMonthlyEMI),
      subtitle: 'Monthly',
      color: metrics.totalMonthlyEMI > metrics.monthlyIncome * 0.5 ? 'var(--accent-red)' : 'var(--text-secondary)',
      icon: '🏦'
    }
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card) => <MetricCard key={card.label} {...card} />)}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'border-color 0.2s, transform 0.15s',
    cursor: 'default'
  },
  iconBox: {
    width: 36, height: 36,
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16
  },
  content: { flex: 1 },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 600,
    marginBottom: 4
  },
  value: {
    fontSize: 22,
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    lineHeight: 1.1,
    marginBottom: 3
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontWeight: 500
  },
  trend: {
    fontSize: 12,
    fontWeight: 700
  }
};

export default MetricCards;
