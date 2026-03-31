import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const getGrade = (s) => {
      if (s >= 80) return { grade: 'Excellent', color: '#22C55E' };
      if (s >= 65) return { grade: 'Good', color: '#3B82F6' };
      if (s >= 50) return { grade: 'Fair', color: '#F5A623' };
      if (s >= 35) return { grade: 'Poor', color: '#F97316' };
      return { grade: 'Critical', color: '#EF4444' };
    };
    const { grade, color } = getGrade(score);
    return (
      <div style={styles.tooltip}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{score}</div>
        <div style={{ fontSize: 12, color, fontWeight: 600 }}>{grade}</div>
      </div>
    );
  }
  return null;
};

const ScoreTrendChart = ({ history, loading }) => {
  if (loading) {
    return <div style={{ height: 180, background: 'var(--bg-elevated)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />;
  }

  if (!history || history.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Score history will appear here as you update your profile</div>
      </div>
    );
  }

  const data = history.map(s => ({
    date: new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: s.totalScore
  }));

  // Show only recent 15 data points on chart
  const displayData = data.slice(-15);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#00C9A7" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 46, 68, 0.8)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {/* Grade reference lines */}
        <ReferenceLine y={80} stroke="rgba(34,197,94,0.2)" strokeDasharray="4 4" label={{ value: 'Excellent', fill: 'rgba(34,197,94,0.4)', fontSize: 10, position: 'right' }} />
        <ReferenceLine y={65} stroke="rgba(59,130,246,0.2)" strokeDasharray="4 4" />
        <ReferenceLine y={50} stroke="rgba(245,166,35,0.2)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="url(#scoreGradient)"
          strokeWidth={2.5}
          dot={{ fill: '#F5A623', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#F5A623', strokeWidth: 2, stroke: 'var(--bg-card)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const styles = {
  empty: { height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 },
  tooltip: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', textAlign: 'center' }
};

export default ScoreTrendChart;
