// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser, clearError } from '../store/slices/authSlice';

// const LoginPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { loading, error, user } = useSelector((s) => s.auth);
//   const [form, setForm] = useState({ email: '', password: '' });

//   useEffect(() => { dispatch(clearError()); }, [dispatch]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await dispatch(loginUser(form));
//     if (loginUser.fulfilled.match(result)) {
//       const u = result.payload.user;
//       navigate(u.isOnboardingComplete ? '/dashboard' : '/onboarding');
//     }
//   };

//   return (
//     <div style={styles.page}>
//       {/* Background decoration */}
//       <div style={styles.bgOrb1} />
//       <div style={styles.bgOrb2} />

//       <div style={styles.container} className="animate-fade-up">
//         {/* Logo */}
//         <div style={styles.logo}>
//           <div style={styles.logoIcon}>₹</div>
//           <div>
//             <div style={styles.logoTitle}>BFHE</div>
//             <div style={styles.logoSub}>Bharat Financial Health Engine</div>
//           </div>
//         </div>

//         <div style={styles.card}>
//           <h2 style={styles.heading}>Welcome back</h2>
//           <p style={styles.subheading}>Sign in to your financial dashboard</p>

//           {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

//           <form onSubmit={handleSubmit} style={styles.form}>
//             <div className="form-group">
//               <label className="form-label">Email Address</label>
//               <input
//                 className="form-input"
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="you@example.com"
//                 required
//                 autoComplete="email"
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <input
//                 className="form-input"
//                 type="password"
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 required
//                 autoComplete="current-password"
//               />
//             </div>

//             <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
//               {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
//             </button>
//           </form>

//           <p style={styles.switchText}>
//             Don't have an account?{' '}
//             <Link to="/register" style={styles.link}>Create one free</Link>
//           </p>
//         </div>

//         <p style={styles.disclaimer}>
//           🔒 Your data is encrypted and never shared with third parties
//         </p>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   page: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '24px',
//     position: 'relative',
//     overflow: 'hidden',
//     background: 'var(--bg-deep)'
//   },
//   bgOrb1: {
//     position: 'fixed', top: '-10%', right: '-5%',
//     width: 500, height: 500,
//     borderRadius: '50%',
//     background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
//     pointerEvents: 'none'
//   },
//   bgOrb2: {
//     position: 'fixed', bottom: '-10%', left: '-5%',
//     width: 400, height: 400,
//     borderRadius: '50%',
//     background: 'radial-gradient(circle, rgba(0,201,167,0.04) 0%, transparent 70%)',
//     pointerEvents: 'none'
//   },
//   container: {
//     width: '100%',
//     maxWidth: 440,
//     position: 'relative',
//     zIndex: 1
//   },
//   logo: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 32,
//     justifyContent: 'center'
//   },
//   logoIcon: {
//     width: 48, height: 48,
//     borderRadius: 12,
//     background: 'linear-gradient(135deg, var(--accent-gold), #E8920A)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: 22, fontWeight: 800,
//     color: '#070B14',
//     fontFamily: 'var(--font-display)'
//   },
//   logoTitle: {
//     fontFamily: 'var(--font-display)',
//     fontSize: 22,
//     fontWeight: 800,
//     color: 'var(--text-primary)',
//     letterSpacing: 2
//   },
//   logoSub: {
//     fontSize: 11,
//     color: 'var(--text-muted)',
//     letterSpacing: 0.5,
//     textTransform: 'uppercase'
//   },
//   card: {
//     background: 'var(--bg-card)',
//     border: '1px solid var(--border)',
//     borderRadius: 20,
//     padding: '36px 32px'
//   },
//   heading: {
//     fontSize: 26,
//     fontWeight: 800,
//     marginBottom: 6,
//     color: 'var(--text-primary)'
//   },
//   subheading: {
//     fontSize: 14,
//     color: 'var(--text-secondary)',
//     marginBottom: 28
//   },
//   form: { display: 'flex', flexDirection: 'column', gap: 18 },
//   switchText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 14,
//     color: 'var(--text-secondary)'
//   },
//   link: {
//     color: 'var(--accent-gold)',
//     textDecoration: 'none',
//     fontWeight: 600
//   },
//   disclaimer: {
//     textAlign: 'center',
//     fontSize: 12,
//     color: 'var(--text-muted)',
//     marginTop: 20
//   }
// };

// export default LoginPage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const u = result.payload.user;
      navigate(u.isOnboardingComplete ? '/dashboard' : '/onboarding');
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container} className="animate-fade-up">
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>₹</div>
          <div>
            <div style={styles.logoTitle}>BFHE</div>
            <div style={styles.logoSub}>Bharat Financial Health Engine</div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.subheading}>Sign in to your financial dashboard</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one free</Link>
          </p>
        </div>

        <p style={styles.disclaimer}>
          🔒 Your data is encrypted and never shared with third parties
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-deep)'
  },
  bgOrb1: {
    position: 'fixed', top: '-10%', right: '-5%',
    width: 500, height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  bgOrb2: {
    position: 'fixed', bottom: '-10%', left: '-5%',
    width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,201,167,0.04) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  container: {
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    zIndex: 1
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center'
  },
  logoIcon: {
    width: 48, height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--gold), #E8920A)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 800,
    color: '#070B14',
    fontFamily: 'var(--font-display)'
  },
  logoTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: 2
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-3)',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '36px 32px'
  },
  heading: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 6,
    color: 'var(--text)'
  },
  subheading: {
    fontSize: 14,
    color: 'var(--text-2)',
    marginBottom: 28
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: 'var(--text-2)'
  },
  link: {
    color: 'var(--gold)',
    textDecoration: 'none',
    fontWeight: 600
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-3)',
    marginTop: 20
  }
};

export default LoginPage;