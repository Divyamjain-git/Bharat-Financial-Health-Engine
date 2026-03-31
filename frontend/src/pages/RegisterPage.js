import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'salaried', phone: '' });

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate('/onboarding');
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} /><div style={styles.bgOrb2} />

      <div style={styles.container} className="animate-fade-up">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>₹</div>
          <div>
            <div style={styles.logoTitle}>BFHE</div>
            <div style={styles.logoSub}>Bharat Financial Health Engine</div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>Create your account</h2>
          <p style={styles.subheading}>Start your financial health journey today</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Arjun Sharma" required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="arjun@example.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input className="form-input" type="tel" name="phone" value={form.phone}
                onChange={handleChange} placeholder="9876543210" maxLength={10} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div style={styles.roleGrid}>
                {[
                  { value: 'salaried', label: '💼 Salaried', desc: 'Fixed monthly salary' },
                  { value: 'business', label: '🏪 Business Owner', desc: 'MSME / Self-employed' }
                ].map(r => (
                  <div key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      ...styles.roleCard,
                      ...(form.role === r.value ? styles.roleCardActive : {})
                    }}>
                    <div style={styles.roleLabel}>{r.label}</div>
                    <div style={styles.roleDesc}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden', background: 'var(--bg-deep)' },
  bgOrb1: { position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  bgOrb2: { position: 'fixed', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,201,167,0.04) 0%, transparent 70%)', pointerEvents: 'none' },
  container: { width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center' },
  logoIcon: { width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-gold), #E8920A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#070B14', fontFamily: 'var(--font-display)' },
  logoTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: 2 },
  logoSub: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' },
  heading: { fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' },
  subheading: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  roleCard: { padding: '14px 12px', border: '2px solid var(--border)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-elevated)' },
  roleCardActive: { borderColor: 'var(--accent-gold)', background: 'rgba(245,166,35,0.08)' },
  roleLabel: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 },
  roleDesc: { fontSize: 11, color: 'var(--text-secondary)' },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' },
  link: { color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }
};

export default RegisterPage;
