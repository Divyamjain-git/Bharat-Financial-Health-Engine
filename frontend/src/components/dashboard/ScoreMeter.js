import React, { useEffect, useRef } from 'react';
import { getScoreColor, getScoreBgColor } from '../../utils/currency';

const ScoreMeter = ({ score, grade, loading }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.72;
    const R = W * 0.38;

    ctx.clearRect(0, 0, W, H);

    // Draw arc track (background)
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, R, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(30, 46, 68, 0.8)';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score arc
    const scoreAngle = startAngle + ((score || 0) / 100) * Math.PI;
    const color = getScoreColor(grade);

    // Gradient for score arc
    const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    grad.addColorStop(0, '#4A5E7A');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, color);

    ctx.beginPath();
    ctx.arc(cx, cy, R, startAngle, scoreAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow effect at score end
    if (score > 0) {
      const glowX = cx + R * Math.cos(scoreAngle);
      const glowY = cy + R * Math.sin(scoreAngle);
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 20);
      glow.addColorStop(0, color + 'AA');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(glowX, glowY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    // Score labels at arc ends
    ctx.font = '11px DM Sans';
    ctx.fillStyle = 'rgba(138, 155, 190, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('0', cx - R - 8, cy + 18);
    ctx.fillText('100', cx + R + 8, cy + 18);

  }, [score, grade, loading]);

  const color = getScoreColor(grade);
  const bgColor = getScoreBgColor(grade);

  return (
    <div style={styles.wrapper}>
      <div style={styles.canvasContainer}>
        {loading ? (
          <div style={styles.skeleton} />
        ) : (
          <canvas ref={canvasRef} width={300} height={180} style={styles.canvas} />
        )}
        {!loading && (
          <div style={styles.scoreOverlay}>
            <div style={{ ...styles.scoreNumber, color }}>{score ?? '--'}</div>
            <div style={{ ...styles.gradeBadge, background: bgColor, color, border: `1px solid ${color}30` }}>
              {grade || 'N/A'}
            </div>
          </div>
        )}
      </div>

      {!loading && score !== null && (
        <div style={styles.description}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            {getGradeMessage(grade)}
          </p>
        </div>
      )}
    </div>
  );
};

const getGradeMessage = (grade) => {
  const messages = {
    Excellent: '🎉 Outstanding! Your finances are in excellent shape.',
    Good: '👍 Good work! A few tweaks can make it excellent.',
    Fair: '📊 Decent foundation, but room for improvement.',
    Poor: '⚠️ Financial stress detected. Take action now.',
    Critical: '🚨 Immediate attention needed. Follow recommendations.'
  };
  return messages[grade] || 'Complete your profile to see your score.';
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' },
  canvasContainer: { position: 'relative', width: 300, height: 180 },
  canvas: { display: 'block' },
  scoreOverlay: {
    position: 'absolute',
    bottom: '4%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  },
  scoreNumber: {
    fontFamily: 'var(--font-display)',
    fontSize: 52,
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: 6
  },
  gradeBadge: {
    display: 'inline-block',
    padding: '3px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  skeleton: {
    width: '100%', height: '100%',
    background: 'var(--bg-elevated)',
    borderRadius: 12,
    animation: 'pulse 1.5s ease infinite'
  },
  description: { marginTop: 12, padding: '0 16px', maxWidth: 260 }
};

export default ScoreMeter;
