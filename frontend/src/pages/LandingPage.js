import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Typewriter component ──────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');
  useEffect(() => {
    const word = words[wi];
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, ci + 1));
        if (ci + 1 === word.length) { setTimeout(() => setDeleting(true), 1800); return; }
        setCi(c => c + 1);
      } else {
        setText(word.slice(0, ci - 1));
        if (ci - 1 === 0) { setDeleting(false); setWi(w => (w + 1) % words.length); setCi(0); return; }
        setCi(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [ci, deleting, wi, words]);
  return (
    <span>
      {text}
      <span style={{ borderRight: '3px solid #F0B429', marginLeft: 2, animation: 'blink 1s step-end infinite' }}/>
    </span>
  );
}

// ── Floating particle canvas ──────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,180,41,${p.alpha})`;
        ctx.fill();
      });
      // Draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(240,180,41,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ── Score UI mock ─────────────────────────────────────────────────────────────
function ScoreMockup() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s = 0;
      const i = setInterval(() => { s += 2; setScore(s); if (s >= 78) clearInterval(i); }, 30);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const color = score >= 80 ? '#31C48D' : score >= 65 ? '#4F8EF7' : score >= 50 ? '#F0B429' : '#F05252';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'rgba(10,15,28,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '0',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,180,41,0.1)',
        maxWidth: 600,
        width: '100%',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Window chrome */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }}/>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }}/>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }}/>
        <div style={{ marginLeft: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          bfhe.app/dashboard
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Financial Health Score</div>
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>Arjun Sharma · Salaried</div>
          </div>
          <div style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#F0B429', fontWeight: 700 }}>
            ↻ Updated just now
          </div>
        </div>

        {/* Score + components */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, alignItems: 'center' }}>
          {/* Arc gauge */}
          <div style={{ textAlign: 'center' }}>
            <svg width="130" height="80" viewBox="0 0 130 80">
              <path d="M 15 70 A 55 55 0 0 1 115 70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round"/>
              <path d="M 15 70 A 55 55 0 0 1 115 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 172.8} 172.8`}
                style={{ transition: 'stroke-dasharray 0.05s linear, stroke 0.3s' }}/>
            </svg>
            <div style={{ marginTop: -8, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 38, fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>out of 100</div>
            <div style={{ marginTop: 6, display: 'inline-block', background: color + '20', border: `1px solid ${color}40`, borderRadius: 20, padding: '2px 10px', fontSize: 11, color, fontWeight: 800 }}>Good</div>
          </div>

          {/* Component bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Debt-to-Income', value: 72, color: '#4F8EF7' },
              { label: 'Savings Rate', value: 65, color: '#F0B429' },
              { label: 'Emergency Fund', value: 50, color: '#F05252' },
              { label: 'Credit Usage', value: 88, color: '#31C48D' },
              { label: 'Expense Ratio', value: 78, color: '#9061F9' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: item.color }}>{item.value}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ height: '100%', background: item.color, borderRadius: 2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric chips row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Income', value: '₹85,000', c: '#0DCFAA' },
            { label: 'EMI', value: '₹18,500', c: '#F0B429' },
            { label: 'Savings', value: '19.4%', c: '#4F8EF7' },
            { label: 'Net Worth', value: '₹12.4L', c: '#9061F9' },
          ].map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.08 }}
              style={{ background: `${m.c}12`, border: `1px solid ${m.c}25`, borderRadius: 8, padding: '7px 12px', flex: 1 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: m.c, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{m.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, stat, statLabel, delay, color = '#F0B429' }) {
  const [ref, inView] = useInView();
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'rgba(10,15,28,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '28px 24px',
        backdropFilter: 'blur(10px)',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      whileHover={{ y: -4, borderColor: color + '40' }}
    >
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: '#EEF2FF', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: stat ? 16 : 0 }}>{desc}</div>
      {stat && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 28, fontWeight: 900, color }}>{stat}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{statLabel}</div>
        </div>
      )}
    </motion.div>
  );
}

// ── Stat counter card ─────────────────────────────────────────────────────────
function StatCounter({ value, suffix, label, color, delay }) {
  const [ref, inView] = useInView();
  const count = useCounter(value, 2000, inView);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5 }}
      style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 48, fontWeight: 900, color, lineHeight: 1 }}>
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{label}</div>
    </motion.div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.onChange(v => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  const COMPANY_LOGOS = ['SBI', 'HDFC', 'ICICI', 'Bajaj', 'Zerodha', 'Groww', 'Razorpay', 'PhonePe', 'Paytm', 'CRED'];

  return (
    <div style={{ background: '#050810', color: '#EEF2FF', fontFamily: "'Instrument Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(240,180,41,0.3); border-radius: 2px; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <motion.nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(5,8,16,0.92)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.3s',
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#F0B429,#d4960f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#050810' }}>₹</div>
          <div>
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: 2 }}>BFHE</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, marginTop: -2 }}>BHARAT FINANCIAL ENGINE</div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Features', 'How it Works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 16px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 13, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.target.style.borderColor = '#F0B429'; e.target.style.color = '#F0B429'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'rgba(255,255,255,0.8)'; }}>
            Sign In
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg,#F0B429,#d4960f)', border: 'none', borderRadius: 8, padding: '7px 18px', color: '#050810', cursor: 'pointer', fontSize: 13, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 800 }}>
            Get Started Free
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 64 }}>
        <ParticleCanvas />

        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(240,180,41,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'glow 4s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', top: '60%', left: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(79,142,247,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left: Text */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            {/* Announcement badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 28, fontSize: 12, color: '#F0B429', fontWeight: 600, cursor: 'pointer' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F0B429', animation: 'glow 1.5s ease-in-out infinite' }}/>
              India's First AI-Powered Financial Health Score
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.div>

            {/* Big headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 20 }}>
              The future of{' '}
              <span style={{ color: '#F0B429', display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>financial</span>
              <br />health starts{' '}
              <span style={{ background: 'linear-gradient(135deg, #F0B429, #0DCFAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Typewriter words={['here.', 'today.', 'with you.', 'for India.']} />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              BFHE gives you a real-time financial health score, tracks your net worth, builds smart budgets using the 50/30/20 rule, and runs what-if simulations — all built for India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(240,180,41,0.35)' }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{ background: 'linear-gradient(135deg,#F0B429,#d4960f)', border: 'none', borderRadius: 10, padding: '13px 26px', color: '#050810', cursor: 'pointer', fontSize: 15, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                Get your free score →
              </motion.button>
              <motion.button whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '13px 22px', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 15, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, transition: 'all 0.15s' }}>
                Watch demo ▶
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
              <div style={{ display: 'flex' }}>
                {['🧑‍💼','👩‍💻','👨‍🏭','👩‍🔬','🧑‍🎓'].map((e, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 60},60%,50%)`, border: '2px solid #050810', marginLeft: i ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{e}</div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#F0B429', fontWeight: 700 }}>2,400+</span> professionals trust BFHE
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScoreMockup />
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Scroll to explore
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, rgba(240,180,41,0.5), transparent)' }}/>
        </motion.div>
      </section>

      {/* ── LOGO MARQUEE ────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '28px 0', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Trusted by professionals at</div>
        <div style={{ display: 'flex', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div style={{ display: 'flex', gap: 56, animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap' }}>
            {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((name, i) => (
              <span key={i} style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: 1, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#F0B429', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Everything you need</div>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, marginBottom: 16 }}>Accelerate your financial journey</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>From scoring your health to running simulations — BFHE gives you every tool to master your money.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          <FeatureCard icon="⬡" title="Financial Health Score" desc="A single 0–100 score based on DTI, savings rate, emergency fund, credit usage and expense ratio — recalculated instantly." stat="5" statLabel="key metrics tracked" color="#F0B429" delay={0}/>
          <FeatureCard icon="◈" title="Net Worth Tracker" desc="Track every asset and liability — from FDs and stocks to home loans — with real-time allocation breakdowns." stat="10+" statLabel="asset categories" color="#0DCFAA" delay={0.07}/>
          <FeatureCard icon="◎" title="Goal Planning" desc="Set financial goals with AI feasibility analysis. Know exactly how much to save each month to hit your targets." stat="∞" statLabel="goals supported" color="#4F8EF7" delay={0.14}/>
          <FeatureCard icon="◧" title="Smart Budget Planner" desc="The 50/30/20 rule, customized for your income. See needs, wants and savings with interactive sliders." stat="50/30/20" statLabel="budgeting framework" color="#9061F9" delay={0.21}/>
          <FeatureCard icon="⟳" title="Financial Simulator" desc="Run what-if scenarios: salary hike, paying off a loan, cutting expenses. See the exact score impact before you decide." stat="5" statLabel="scenario templates" color="#FF8A4C" delay={0.28}/>
          <FeatureCard icon="◉" title="Smart Alerts" desc="Real-time alerts for score drops, high DTI, goal deadlines, low emergency funds and credit danger zones." stat="10" statLabel="alert types" color="#F05252" delay={0.35}/>
        </div>
      </section>

      {/* ── STATS SECTION ───────────────────────────────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCounter value={2400} suffix="+" label="Active users" color="#F0B429" delay={0}/>
          <StatCounter value={85} suffix="%" label="Average score improvement in 3 months" color="#0DCFAA" delay={0.1}/>
          <StatCounter value={4200} suffix="+" label="Financial goals tracked" color="#4F8EF7" delay={0.2}/>
          <StatCounter value={98} suffix="%" label="Users say BFHE changed their habits" color="#9061F9" delay={0.3}/>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0DCFAA', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Simple setup</div>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900 }}>Up and running in 3 minutes</h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { step: '01', title: 'Create your free account', desc: 'Sign up in 30 seconds — no credit card, no KYC. Just your name and role.', icon: '🔐', color: '#F0B429' },
            { step: '02', title: 'Enter your financial profile', desc: 'Input income, expenses, loans and savings. The guided wizard makes it easy.', icon: '📋', color: '#0DCFAA' },
            { step: '03', title: 'Get your score instantly', desc: 'Your personalized financial health score appears with a full breakdown and action plan.', icon: '⬡', color: '#4F8EF7' },
            { step: '04', title: 'Track, simulate, improve', desc: 'Set goals, run simulations, follow recommendations and watch your score climb.', icon: '📈', color: '#9061F9' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, padding: '28px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, fontWeight: 800, color: item.color, opacity: 0.5, letterSpacing: 2, marginBottom: 6 }}>{item.step}</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.color + '15', border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto' }}>{item.icon}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6, color: '#EEF2FF' }}>{item.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9061F9', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Testimonials</div>
            <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900 }}>Real results, real people</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { name: 'Priya Mehta', role: 'Software Engineer, Bengaluru', quote: 'My score went from 52 to 74 in 2 months. The simulator showed me exactly which loan to pay off first.', avatar: '👩‍💻', score: 74, color: '#0DCFAA' },
              { name: 'Rahul Gupta', role: 'Business Owner, Delhi', quote: 'Never understood my finances until BFHE. The 50/30/20 planner alone saved me ₹18,000 last month.', avatar: '👨‍🏭', score: 68, color: '#F0B429' },
              { name: 'Ananya Singh', role: 'Product Manager, Mumbai', quote: 'The goal tracker is incredible. I\'m on track for my house down payment 4 months ahead of schedule!', avatar: '👩‍🔬', score: 82, color: '#4F8EF7' },
            ].map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ background: 'rgba(10,15,28,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.color + '20', border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 900, color: t.color }}>{t.score}</div>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(240,180,41,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Start your financial<br />
            <span style={{ color: '#F0B429' }}>health journey today</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>Join thousands of Indians who've taken control of their finances with BFHE. Free forever.</p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(240,180,41,0.4)' }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg,#F0B429,#d4960f)', border: 'none', borderRadius: 12, padding: '16px 36px', color: '#050810', cursor: 'pointer', fontSize: 17, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 800 }}>
            Get your free score →
          </motion.button>
          <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No credit card · No KYC · 100% free</div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#F0B429,#d4960f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#050810' }}>₹</div>
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1.5 }}>BFHE</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 Bharat Financial Health Engine</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
