import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR } from '../../utils/currency';

const COLORS = [
  '#F5A623', '#00C9A7', '#3B82F6', '#EC4899', '#8B5CF6',
  '#F97316', '#14B8A6', '#EF4444', '#A78BFA', '#10B981'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{payload[0].name}</div>
        <div style={{ color: 'var(--accent-gold)' }}>{formatINR(payload[0].value)}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {payload[0].payload.percent?.toFixed(1)}% of expenses
        </div>
      </div>
    );
  }
  return null;
};

const ExpenseDonutChart = ({ expenses, loading }) => {
  if (loading) {
    return (
      <div style={styles.skeleton}>
        <div style={styles.skeletonCircle} />
      </div>
    );
  }

  if (!expenses) return null;

  const expenseLabels = {
    houseRent: 'House Rent',
    groceries: 'Groceries',
    electricityBill: 'Electricity',
    gasBill: 'Gas',
    waterBill: 'Water',
    internetMobile: 'Internet & Mobile',
    medicalExpenses: 'Medical',
    vehicleFuel: 'Vehicle Fuel',
    schoolFees: 'Education',
    otherExpenses: 'Others'
  };

  const total = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);

  const data = Object.entries(expenses)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: expenseLabels[key] || key,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No expense data available</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div style={styles.centerText}>
          <div style={styles.centerLabel}>Total</div>
          <div style={styles.centerValue}>{formatINR(total)}</div>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {data.slice(0, 6).map((item, idx) => (
          <div key={idx} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: COLORS[idx % COLORS.length] }} />
            <div style={styles.legendText}>
              <span style={styles.legendName}>{item.name}</span>
              <span style={styles.legendValue}>{formatINR(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column' },
  chartContainer: { position: 'relative' },
  centerText: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center', pointerEvents: 'none'
  },
  centerLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  centerValue: { fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' },
  legend: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, maxHeight: 180, overflowY: 'auto' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendText: { display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' },
  legendName: { fontSize: 13, color: 'var(--text-secondary)' },
  legendValue: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  skeleton: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 },
  skeletonCircle: { width: 160, height: 160, borderRadius: '50%', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease infinite' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160 },
  tooltip: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13
  }
};

export default ExpenseDonutChart;
