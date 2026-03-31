// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   LineChart, Line, AreaChart, Area, BarChart, Bar,
//   XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
// } from 'recharts';
// import api from '../services/api';
// import { PageHeader, StatCard } from '../components/ui';
// import { formatINR } from '../utils/currency';

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const fmt = (n) => Math.round(n).toLocaleString('en-IN');
// const pct = (n) => (typeof n === 'number' ? n.toFixed(2) + '%' : '—');
// const clr = (v, goodIfPositive = true) =>
//   v === 0 ? 'var(--text-2)' : (v > 0) === goodIfPositive ? 'var(--green)' : 'var(--red)';

// const TABS = [
//   { id: 'overview',   icon: '📊', label: 'Live CPI' },
//   { id: 'goals',      icon: '🎯', label: 'Goal Planner' },
//   { id: 'emergency',  icon: '🛡️', label: 'Emergency Fund' },
//   { id: 'simulate',   icon: '⚡', label: 'What-If' },
// ];

// const GOAL_CATEGORIES = [
//   { value: 'home', label: '🏠 Home Purchase' },
//   { value: 'vehicle', label: '🚗 Vehicle' },
//   { value: 'education', label: '🎓 Education' },
//   { value: 'retirement', label: '🏖️ Retirement' },
//   { value: 'wedding', label: '💍 Wedding' },
//   { value: 'vacation', label: '✈️ Vacation' },
//   { value: 'business', label: '🏪 Business' },
//   { value: 'custom', label: '🎯 Other' },
// ];

// // ── Custom Tooltip ────────────────────────────────────────────────────────────
// const ChartTooltip = ({ active, payload, label, prefix = '₹' }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
//       <div style={{ color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} style={{ color: p.color, fontWeight: 700 }}>
//           {p.name}: {prefix}{typeof p.value === 'number' ? fmt(p.value) : p.value}
//           {prefix === '%' ? '' : ''}
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Source Badge ──────────────────────────────────────────────────────────────
// const SourceBadge = ({ source, month }) => {
//   const configs = {
//     live:     { color: 'var(--green)',  bg: 'var(--green)',  label: '● Live' },
//     cache:    { color: 'var(--gold)',   bg: 'var(--gold)',   label: '◎ Cached' },
//     fallback: { color: 'var(--text-3)', bg: 'var(--text-3)', label: '○ Offline' },
//   };
//   const c = configs[source] || configs.fallback;
//   return (
//     <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg + '18', padding: '3px 8px', borderRadius: 20, letterSpacing: 0.4 }}>
//       {c.label} · MoSPI {month}
//     </span>
//   );
// };

// // ═════════════════════════════════════════════════════════════════════════════
// export default function InflationPage() {
//   const [tab, setTab] = useState('overview');
//   const [cpiData, setCpiData] = useState(null);
//   const [cpiLoading, setCpiLoading] = useState(true);

//   // Goal planner state
//   const [goalForm, setGoalForm] = useState({ goalName: '', nominalTarget: '', yearsToGoal: '', expectedReturn: '7', customInflationRate: '' });
//   const [goalResult, setGoalResult] = useState(null);
//   const [goalLoading, setGoalLoading] = useState(false);

//   // Emergency fund state
//   const [efForm, setEfForm] = useState({ emergencyFundAmount: '', savingsAccountRate: '3.5', customInflationRate: '', projectionYears: '5' });
//   const [efResult, setEfResult] = useState(null);
//   const [efLoading, setEfLoading] = useState(false);

//   // Simulation state
//   const [simForm, setSimForm] = useState({ inflationScenario: 'moderate', customRate: '', years: '3' });
//   const [simResult, setSimResult] = useState(null);
//   const [simLoading, setSimLoading] = useState(false);

//   // Load live CPI on mount
//   useEffect(() => {
//     api.get('/inflation/rate')
//       .then(r => setCpiData(r.data.data))
//       .catch(() => setCpiData(null))
//       .finally(() => setCpiLoading(false));
//   }, []);

//   const runGoalPlanner = useCallback(async () => {
//     setGoalLoading(true);
//     try {
//       const r = await api.post('/inflation/goal-planner', {
//         ...goalForm,
//         nominalTarget: parseFloat(goalForm.nominalTarget),
//         yearsToGoal: parseFloat(goalForm.yearsToGoal),
//         expectedReturn: parseFloat(goalForm.expectedReturn),
//         customInflationRate: goalForm.customInflationRate ? parseFloat(goalForm.customInflationRate) : undefined,
//       });
//       setGoalResult(r.data.data);
//     } catch (e) { console.error(e); }
//     setGoalLoading(false);
//   }, [goalForm]);

//   const runEFErosion = useCallback(async () => {
//     setEfLoading(true);
//     try {
//       const r = await api.post('/inflation/emergency-fund', {
//         ...efForm,
//         emergencyFundAmount: parseFloat(efForm.emergencyFundAmount),
//         savingsAccountRate: parseFloat(efForm.savingsAccountRate),
//         projectionYears: parseInt(efForm.projectionYears),
//         customInflationRate: efForm.customInflationRate ? parseFloat(efForm.customInflationRate) : undefined,
//       });
//       setEfResult(r.data.data);
//     } catch (e) { console.error(e); }
//     setEfLoading(false);
//   }, [efForm]);

//   const runInflationSim = useCallback(async () => {
//     setSimLoading(true);
//     try {
//       const r = await api.post('/inflation/simulate', {
//         inflationScenario: simForm.inflationScenario,
//         customRate: simForm.customRate ? parseFloat(simForm.customRate) : undefined,
//         years: parseInt(simForm.years),
//       });
//       setSimResult(r.data.data);
//     } catch (e) { console.error(e); }
//     setSimLoading(false);
//   }, [simForm]);

//   // ── Render helpers ──────────────────────────────────────────────────────────
//   const currentRate = cpiData?.rate ?? '—';
//   const rateColor = typeof currentRate === 'number'
//     ? currentRate > 6 ? 'var(--red)' : currentRate > 4 ? 'var(--gold)' : 'var(--green)'
//     : 'var(--text-3)';

//   return (
//     <div style={{ padding: '28px 28px 48px' }}>
//       <PageHeader
//         title="📈 Inflation Intelligence"
//         subtitle="Live CPI tracking, inflation-adjusted goals, and purchasing power analysis"
//       />

//       {/* Live CPI Banner */}
//       {!cpiLoading && cpiData && (
//         <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
//           style={{ background: 'var(--bg-card)', border: `1px solid ${rateColor}33`, borderRadius: 'var(--r-lg)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//             <span style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 900, color: rateColor }}>{pct(currentRate)}</span>
//             <div>
//               <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>India CPI Inflation</div>
//               <SourceBadge source={cpiData.source} month={cpiData.month} />
//             </div>
//           </div>
//           <div style={{ height: 40, width: 1, background: 'var(--border)' }} />
//           <div style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 320 }}>
//             RBI target: <strong style={{ color: 'var(--text)' }}>4% ± 2%</strong> · Current rate is{' '}
//             <strong style={{ color: rateColor }}>
//               {currentRate < 2 ? 'below target band' : currentRate <= 6 ? 'within target band' : 'above target band'}
//             </strong>
//           </div>
//         </motion.div>
//       )}

//       {/* Tab Nav */}
//       <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', padding: 4, width: 'fit-content' }}>
//         {TABS.map(t => (
//           <button key={t.id} onClick={() => setTab(t.id)}
//             style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
//               background: tab === t.id ? 'var(--bg-card)' : 'transparent',
//               color: tab === t.id ? 'var(--gold)' : 'var(--text-3)',
//               boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
//             {t.icon} {t.label}
//           </button>
//         ))}
//       </div>

//       <AnimatePresence mode="wait">

//         {/* ── TAB: LIVE CPI ─────────────────────────────────────────────────── */}
//         {tab === 'overview' && (
//           <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//             {cpiLoading && <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 40 }}>Fetching live CPI data...</div>}
//             {!cpiLoading && cpiData && (
//               <>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12, marginBottom: 24 }}>
//                   <StatCard label="Current CPI (YoY)" value={pct(cpiData.rate)} color={rateColor} icon="📊" delay={0} sub={`As of ${cpiData.month}`} />
//                   <StatCard label="RBI Target" value="4.0%" color="var(--blue)" icon="🏦" delay={0.05} sub="± 2% tolerance band" />
//                   <StatCard label="Gap from Target" value={pct(Math.abs(cpiData.rate - 4))} color={Math.abs(cpiData.rate - 4) < 2 ? 'var(--green)' : 'var(--red)'} icon="📐" delay={0.1} sub={cpiData.rate > 4 ? 'above target' : 'below target'} />
//                   <StatCard label="Data Source" value="MoSPI" color="var(--teal)" icon="🇮🇳" delay={0.15} sub={`via data.gov.in · ${cpiData.source}`} />
//                 </div>

//                 {cpiData.historical?.length > 0 && (
//                   <div className="card">
//                     <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>CPI Trend — Last 13 Months</div>
//                     <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>India headline inflation (year-on-year %)</div>
//                     <ResponsiveContainer width="100%" height={220}>
//                       <AreaChart data={cpiData.historical} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
//                         <defs>
//                           <linearGradient id="cpiGrad" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor={rateColor} stopOpacity={0.25} />
//                             <stop offset="95%" stopColor={rateColor} stopOpacity={0} />
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//                         <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
//                         <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} domain={[0, 'auto']} />
//                         <Tooltip content={<ChartTooltip prefix="" />} />
//                         <ReferenceLine y={4} stroke="var(--blue)" strokeDasharray="4 3" label={{ value: 'RBI 4%', fill: 'var(--blue)', fontSize: 10 }} />
//                         <ReferenceLine y={2} stroke="var(--green)" strokeDasharray="4 3" label={{ value: '2%', fill: 'var(--green)', fontSize: 10 }} />
//                         <ReferenceLine y={6} stroke="var(--red)" strokeDasharray="4 3" label={{ value: '6%', fill: 'var(--red)', fontSize: 10 }} />
//                         <Area type="monotone" dataKey="rate" stroke={rateColor} fill="url(#cpiGrad)" strokeWidth={2} dot={{ fill: rateColor, r: 3 }} name="CPI %" />
//                       </AreaChart>
//                     </ResponsiveContainer>

//                     <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
//                       <strong style={{ color: 'var(--text)' }}>What this means for you: </strong>
//                       At {pct(cpiData.rate)} inflation, ₹1,00,000 today will require{' '}
//                       <strong style={{ color: rateColor }}>₹{fmt(100000 * Math.pow(1 + cpiData.rate / 100, 5))}</strong> in 5 years to buy the same things.
//                       Your savings need to beat this rate to grow in real terms.
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//             {!cpiLoading && !cpiData && (
//               <div className="card" style={{ textAlign: 'center', padding: 40 }}>
//                 <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
//                 <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>CPI data unavailable</div>
//                 <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>Using built-in fallback rate (4%). Check your internet connection.</div>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* ── TAB: GOAL PLANNER ─────────────────────────────────────────────── */}
//         {tab === 'goals' && (
//           <motion.div key="goals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>

//               {/* Input form */}
//               <div className="card">
//                 <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🎯 Set Your Goal</div>
//                 <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See the real future cost adjusted for inflation</div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                   <div className="form-group">
//                     <label className="form-label">Category</label>
//                     <select className="form-select" value={goalForm.goalName} onChange={e => setGoalForm({ ...goalForm, goalName: e.target.value })}>
//                       <option value="">Select category…</option>
//                       {GOAL_CATEGORIES.map(g => <option key={g.value} value={g.label}>{g.label}</option>)}
//                     </select>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Target Amount Today (₹)</label>
//                     <input className="form-input" type="number" placeholder="e.g. 5000000" value={goalForm.nominalTarget} onChange={e => setGoalForm({ ...goalForm, nominalTarget: e.target.value })} />
//                     <span style={{ fontSize: 11, color: 'var(--text-3)' }}>What this goal costs in today's money</span>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Years to Goal</label>
//                     <input className="form-input" type="number" placeholder="e.g. 10" min="1" max="40" value={goalForm.yearsToGoal} onChange={e => setGoalForm({ ...goalForm, yearsToGoal: e.target.value })} />
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                     <div className="form-group">
//                       <label className="form-label">Expected Return (%)</label>
//                       <input className="form-input" type="number" placeholder="7" value={goalForm.expectedReturn} onChange={e => setGoalForm({ ...goalForm, expectedReturn: e.target.value })} />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Custom Inflation (%)</label>
//                       <input className="form-input" type="number" placeholder={`Live: ${cpiData?.rate ?? '4'}%`} value={goalForm.customInflationRate} onChange={e => setGoalForm({ ...goalForm, customInflationRate: e.target.value })} />
//                     </div>
//                   </div>
//                   <button className="btn btn-primary w-full" onClick={runGoalPlanner} disabled={goalLoading || !goalForm.nominalTarget || !goalForm.yearsToGoal}>
//                     {goalLoading ? <><span className="spinner" /> Calculating…</> : '▶ Calculate Inflation-Adjusted Goal'}
//                   </button>
//                 </div>
//               </div>

//               {/* Results */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 {!goalResult && (
//                   <div className="card" style={{ textAlign: 'center', padding: 48 }}>
//                     <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
//                     <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Enter your goal details</div>
//                     <div style={{ fontSize: 13, color: 'var(--text-2)' }}>See the true cost of your goals after inflation erodes purchasing power</div>
//                   </div>
//                 )}
//                 {goalResult && (
//                   <>
//                     {/* Cost Breakdown */}
//                     <div className="card">
//                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>💰 Inflation-Adjusted Cost</div>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Today's Cost</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>₹{fmt(goalResult.nominalTarget)}</div>
//                         </div>
//                         <div style={{ background: 'var(--red)10', border: '1px solid var(--red)30', borderRadius: 10, padding: 14, textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Future Cost ({goalResult.years}yr)</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--red)' }}>₹{fmt(goalResult.inflationAdjustedTarget)}</div>
//                         </div>
//                       </div>
//                       <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
//                         <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Inflation Premium</span>
//                         <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)' }}>+₹{fmt(goalResult.inflationPremium)}</span>
//                       </div>
//                       <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
//                         <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Real Return (after inflation)</span>
//                         <span style={{ fontSize: 13, fontWeight: 800, color: clr(goalResult.realReturnRate) }}>{pct(goalResult.realReturnRate)}</span>
//                       </div>
//                       <div style={{ background: 'var(--gold)15', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gold)30', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                         <div style={{ textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Monthly SIP (Nominal)</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-2)' }}>₹{fmt(goalResult.nominalSIP)}</div>
//                         </div>
//                         <div style={{ textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Monthly SIP (Inflation-Adj.)</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)' }}>₹{fmt(goalResult.realSIP)}</div>
//                         </div>
//                       </div>
//                       {goalResult.extraSIPNeeded > 0 && (
//                         <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--red)10', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--red)' }}>
//                           You need <strong style={{ color: 'var(--red)' }}>₹{fmt(goalResult.extraSIPNeeded)}/month extra</strong> vs a non-inflation estimate.
//                         </div>
//                       )}
//                       <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--gold)' }}>
//                         {goalResult.insight}
//                       </div>
//                     </div>

//                     {/* Projection chart */}
//                     {goalResult.projection?.length > 0 && (
//                       <div className="card">
//                         <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Accumulation vs Inflation-Adjusted Target</div>
//                         <ResponsiveContainer width="100%" height={200}>
//                           <LineChart data={goalResult.projection} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//                             <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} label={{ value: 'Year', position: 'insideBottom', fill: 'var(--text-3)', fontSize: 10 }} />
//                             <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
//                             <Tooltip content={<ChartTooltip />} />
//                             <Line type="monotone" dataKey="sipAccumulated" stroke="var(--gold)" strokeWidth={2} dot={false} name="SIP Accumulated" />
//                             <Line type="monotone" dataKey="nominalCost" stroke="var(--red)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Inflation-Adj. Cost" />
//                           </LineChart>
//                         </ResponsiveContainer>
//                         <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 12 }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: 'var(--gold)' }} /><span>Your SIP corpus</span></div>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: 'var(--red)', borderTop: '2px dashed var(--red)' }} /><span>Goal cost (inflation-adj.)</span></div>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* ── TAB: EMERGENCY FUND ───────────────────────────────────────────── */}
//         {tab === 'emergency' && (
//           <motion.div key="emergency" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>

//               {/* Input */}
//               <div className="card">
//                 <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🛡️ Analyse Your Emergency Fund</div>
//                 <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See how much purchasing power you lose keeping cash idle</div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                   <div className="form-group">
//                     <label className="form-label">Emergency Fund Amount (₹)</label>
//                     <input className="form-input" type="number" placeholder="e.g. 150000" value={efForm.emergencyFundAmount} onChange={e => setEfForm({ ...efForm, emergencyFundAmount: e.target.value })} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Savings Account Rate (%)</label>
//                     <input className="form-input" type="number" placeholder="3.5" value={efForm.savingsAccountRate} onChange={e => setEfForm({ ...efForm, savingsAccountRate: e.target.value })} />
//                     <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Typical: SBI 2.7%, HDFC 3%, IDFC 7%</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                     <div className="form-group">
//                       <label className="form-label">Projection (years)</label>
//                       <input className="form-input" type="number" placeholder="5" min="1" max="10" value={efForm.projectionYears} onChange={e => setEfForm({ ...efForm, projectionYears: e.target.value })} />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Custom Inflation (%)</label>
//                       <input className="form-input" type="number" placeholder={`Live: ${cpiData?.rate ?? '4'}%`} value={efForm.customInflationRate} onChange={e => setEfForm({ ...efForm, customInflationRate: e.target.value })} />
//                     </div>
//                   </div>
//                   <button className="btn btn-primary w-full" onClick={runEFErosion} disabled={efLoading || !efForm.emergencyFundAmount}>
//                     {efLoading ? <><span className="spinner" /> Analysing…</> : '▶ Analyse Erosion'}
//                   </button>
//                 </div>
//               </div>

//               {/* Results */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 {!efResult && (
//                   <div className="card" style={{ textAlign: 'center', padding: 48 }}>
//                     <div style={{ fontSize: 44, marginBottom: 12 }}>💸</div>
//                     <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Enter your fund details</div>
//                     <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Discover the silent cost of keeping money in a low-yield savings account</div>
//                   </div>
//                 )}
//                 {efResult && (
//                   <>
//                     {/* Alert banner */}
//                     <div style={{ padding: '14px 18px', background: efResult.isEroding ? 'var(--red)12' : 'var(--gold)12', border: `1px solid ${efResult.isEroding ? 'var(--red)' : 'var(--gold)'}40`, borderRadius: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
//                       {efResult.alert}
//                     </div>

//                     {/* Summary cards */}
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
//                       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
//                         <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Fund Today</div>
//                         <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text)' }}>₹{fmt(efResult.emergencyFundAmount)}</div>
//                       </div>
//                       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
//                         <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Real Value ({efResult.projectionYears}yr)</div>
//                         <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--red)' }}>₹{fmt(efResult.summary.valueAfterYears)}</div>
//                       </div>
//                       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
//                         <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Purchasing Power Lost</div>
//                         <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--red)' }}>₹{fmt(efResult.summary.purchasingPowerLoss)}</div>
//                       </div>
//                       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
//                         <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Real Return Rate</div>
//                         <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: clr(efResult.realReturnRate) }}>{pct(efResult.realReturnRate)}/yr</div>
//                       </div>
//                     </div>

//                     {/* Erosion chart */}
//                     <div className="card">
//                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Purchasing Power Over Time</div>
//                       <ResponsiveContainer width="100%" height={200}>
//                         <BarChart data={efResult.yearlyErosion} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
//                           <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//                           <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} label={{ value: 'Year', fill: 'var(--text-3)', fontSize: 10 }} />
//                           <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
//                           <Tooltip content={<ChartTooltip />} />
//                           <Bar dataKey="realValue" fill="var(--teal)" name="Real Value" radius={[4, 4, 0, 0]} />
//                           <Bar dataKey="nominalValue" fill="var(--bg-elevated)" name="Nominal Value" radius={[4, 4, 0, 0]} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                       <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 12 }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--teal)' }} /><span>Real purchasing power</span></div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} /><span>Nominal (with interest)</span></div>
//                       </div>
//                     </div>

//                     {/* Alternative */}
//                     {efResult.alternativeLiquidFund && (
//                       <div className="card" style={{ borderColor: 'var(--green)30', background: 'var(--green)08' }}>
//                         <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--green)' }}>💡 Better Alternative: Liquid Mutual Fund</div>
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, fontSize: 13 }}>
//                           <div>
//                             <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Expected Rate</div>
//                             <div style={{ fontWeight: 700 }}>{efResult.alternativeLiquidFund.rate}%</div>
//                           </div>
//                           <div>
//                             <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Real Return</div>
//                             <div style={{ fontWeight: 700, color: 'var(--green)' }}>{pct(efResult.alternativeLiquidFund.realReturn)}</div>
//                           </div>
//                           <div>
//                             <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Extra Preserved</div>
//                             <div style={{ fontWeight: 700, color: 'var(--green)' }}>+₹{fmt(efResult.alternativeLiquidFund.extraPreserved)}</div>
//                           </div>
//                         </div>
//                         {efResult.suggestions?.length > 0 && (
//                           <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)' }}>
//                             Try: {efResult.suggestions[0].platforms.join(', ')}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* ── TAB: INFLATION WHAT-IF ────────────────────────────────────────── */}
//         {tab === 'simulate' && (
//           <motion.div key="simulate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>

//               {/* Input */}
//               <div className="card">
//                 <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>⚡ Inflation Scenarios</div>
//                 <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See how different inflation environments affect your financial health score</div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

//                   {/* Scenario picker */}
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                     {[
//                       { id: 'low',      icon: '🌿', label: 'Low (2.5%)',     sub: 'Below RBI target band' },
//                       { id: 'moderate', icon: '📊', label: `Live (${cpiData?.rate?.toFixed(2) ?? '4'}%)`,  sub: 'Current MoSPI CPI' },
//                       { id: 'high',     icon: '🔥', label: 'High (7.5%)',    sub: 'Above RBI tolerance' },
//                       { id: 'custom',   icon: '✏️', label: 'Custom rate',    sub: 'Enter your own' },
//                     ].map(s => (
//                       <button key={s.id} onClick={() => setSimForm({ ...simForm, inflationScenario: s.id })}
//                         style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: `1px solid ${simForm.inflationScenario === s.id ? 'var(--gold)' : 'var(--border)'}`, background: simForm.inflationScenario === s.id ? 'var(--gold-dim)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
//                         <span style={{ fontSize: 20 }}>{s.icon}</span>
//                         <div>
//                           <div style={{ fontSize: 13, fontWeight: 700, color: simForm.inflationScenario === s.id ? 'var(--gold)' : 'var(--text)' }}>{s.label}</div>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.sub}</div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>

//                   {simForm.inflationScenario === 'custom' && (
//                     <div className="form-group">
//                       <label className="form-label">Custom Inflation Rate (%)</label>
//                       <input className="form-input" type="number" placeholder="e.g. 5.5" value={simForm.customRate} onChange={e => setSimForm({ ...simForm, customRate: e.target.value })} />
//                     </div>
//                   )}

//                   <div className="form-group">
//                     <label className="form-label">Projection Period (years)</label>
//                     <input className="form-input" type="number" placeholder="3" min="1" max="10" value={simForm.years} onChange={e => setSimForm({ ...simForm, years: e.target.value })} />
//                   </div>

//                   <button className="btn btn-primary w-full" onClick={runInflationSim} disabled={simLoading}>
//                     {simLoading ? <><span className="spinner" /> Running…</> : '▶ Run Inflation Simulation'}
//                   </button>
//                 </div>
//               </div>

//               {/* Results */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 {!simResult && (
//                   <div className="card" style={{ textAlign: 'center', padding: 48 }}>
//                     <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
//                     <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Choose an inflation scenario</div>
//                     <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Understand how inflation silently erodes your financial health score over time</div>
//                   </div>
//                 )}
//                 {simResult && (
//                   <>
//                     {/* Score impact */}
//                     <div className="card">
//                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>
//                         {simResult.scenario.label} · {simResult.scenario.rate}% Inflation
//                       </div>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Current Score</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>{simResult.baseMetrics.currentScore}</div>
//                         </div>
//                         <div style={{ background: simResult.summary.scoreDelta < -5 ? 'var(--red)10' : 'var(--gold)10', border: `1px solid ${simResult.summary.scoreDelta < -5 ? 'var(--red)' : 'var(--gold)'}30`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Projected Score ({simResult.summary.yearsSimulated}yr)</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: simResult.summary.scoreDelta < -5 ? 'var(--red)' : 'var(--gold)' }}>{simResult.summary.finalScore}</div>
//                         </div>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
//                           <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Score Change</div>
//                           <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: clr(simResult.summary.scoreDelta) }}>
//                             {simResult.summary.scoreDelta >= 0 ? '+' : ''}{simResult.summary.scoreDelta}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Income squeeze breakdown */}
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Real Income Squeeze</span>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>-₹{fmt(simResult.summary.incomeSqueeze)}/mo</span>
//                         </div>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Expense Growth</span>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>+₹{fmt(simResult.summary.expenseGrowth)}/mo</span>
//                         </div>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Savings Rate Change</span>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: clr(simResult.summary.savingsRateChange) }}>{simResult.summary.savingsRateChange >= 0 ? '+' : ''}{pct(simResult.summary.savingsRateChange)}</span>
//                         </div>
//                         <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Current Savings Rate</span>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>{pct(simResult.baseMetrics.savingsRate)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Projection chart */}
//                     <div className="card">
//                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Year-by-Year Projection</div>
//                       <ResponsiveContainer width="100%" height={200}>
//                         <LineChart data={simResult.projections} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
//                           <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//                           <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
//                           <YAxis yAxisId="score" domain={[0, 100]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
//                           <YAxis yAxisId="income" orientation="right" tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
//                           <Tooltip content={<ChartTooltip prefix="" />} />
//                           <Line yAxisId="score" type="monotone" dataKey="simulatedScore" stroke="var(--gold)" strokeWidth={2} dot={{ fill: 'var(--gold)', r: 4 }} name="Score" />
//                           <Line yAxisId="income" type="monotone" dataKey="realIncome" stroke="var(--teal)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Real Income" />
//                           <Line yAxisId="income" type="monotone" dataKey="inflatedExpenses" stroke="var(--red)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Expenses" />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {/* Action plan */}
//                     {simResult.recommendedActions?.length > 0 && (
//                       <div className="card">
//                         <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>🛡️ How to Defend Against Inflation</div>
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                           {simResult.recommendedActions.map((a, i) => (
//                             <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--gold)' }}>
//                               <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
//                               <span>{a}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}

//       </AnimatePresence>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { PageHeader, StatCard } from '../components/ui';
import { formatINR } from '../utils/currency';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(n).toLocaleString('en-IN');
const pct = (n) => (typeof n === 'number' ? n.toFixed(2) + '%' : '—');
const clr = (v, goodIfPositive = true) =>
  v === 0 ? 'var(--text-2)' : (v > 0) === goodIfPositive ? 'var(--green)' : 'var(--red)';

const TABS = [
  { id: 'overview',   icon: '📊', label: 'Live CPI' },
  { id: 'goals',      icon: '🎯', label: 'Goal Planner' },
  { id: 'emergency',  icon: '🛡️', label: 'Emergency Fund' },
  { id: 'simulate',   icon: '⚡', label: 'What-If' },
];

const GOAL_CATEGORIES = [
  { value: 'home', label: '🏠 Home Purchase' },
  { value: 'vehicle', label: '🚗 Vehicle' },
  { value: 'education', label: '🎓 Education' },
  { value: 'retirement', label: '🏖️ Retirement' },
  { value: 'wedding', label: '💍 Wedding' },
  { value: 'vacation', label: '✈️ Vacation' },
  { value: 'business', label: '🏪 Business' },
  { value: 'custom', label: '🎯 Other' },
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? fmt(p.value) : p.value}
          {prefix === '%' ? '' : ''}
        </div>
      ))}
    </div>
  );
};

// ── Source Badge ──────────────────────────────────────────────────────────────
const SourceBadge = ({ source, month }) => {
  const configs = {
    live:     { color: 'var(--green)',  bg: 'var(--green)',  label: '● Live' },
    cache:    { color: 'var(--gold)',   bg: 'var(--gold)',   label: '◎ Cached' },
    fallback: { color: 'var(--text-3)', bg: 'var(--text-3)', label: '○ Offline' },
  };
  const c = configs[source] || configs.fallback;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg + '18', padding: '3px 8px', borderRadius: 20, letterSpacing: 0.4 }}>
      {c.label} · MoSPI {month}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export default function InflationPage() {
  const [tab, setTab] = useState('overview');
  const [cpiData, setCpiData] = useState(null);
  const [cpiLoading, setCpiLoading] = useState(true);

  // Goal planner state
  const [goalForm, setGoalForm] = useState({ goalName: '', nominalTarget: '', yearsToGoal: '', expectedReturn: '7', customInflationRate: '' });
  const [goalResult, setGoalResult] = useState(null);
  const [goalLoading, setGoalLoading] = useState(false);

  // Emergency fund state
  const [efForm, setEfForm] = useState({ emergencyFundAmount: '', savingsAccountRate: '3.5', customInflationRate: '', projectionYears: '5' });
  const [efResult, setEfResult] = useState(null);
  const [efLoading, setEfLoading] = useState(false);

  // Simulation state
  const [simForm, setSimForm] = useState({ inflationScenario: 'moderate', customRate: '', years: '3' });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Load live CPI on mount
  useEffect(() => {
    api.get('/inflation/rate')
      .then(r => setCpiData(r.data.data))
      .catch(() => setCpiData(null))
      .finally(() => setCpiLoading(false));
  }, []);

  const runGoalPlanner = useCallback(async () => {
    setGoalLoading(true);
    try {
      const r = await api.post('/inflation/goal-planner', {
        ...goalForm,
        nominalTarget: parseFloat(goalForm.nominalTarget),
        yearsToGoal: parseFloat(goalForm.yearsToGoal),
        expectedReturn: parseFloat(goalForm.expectedReturn),
        customInflationRate: goalForm.customInflationRate ? parseFloat(goalForm.customInflationRate) : undefined,
      });
      setGoalResult(r.data.data);
    } catch (e) { console.error(e); }
    setGoalLoading(false);
  }, [goalForm]);

  const runEFErosion = useCallback(async () => {
    setEfLoading(true);
    try {
      const r = await api.post('/inflation/emergency-fund', {
        ...efForm,
        emergencyFundAmount: parseFloat(efForm.emergencyFundAmount),
        savingsAccountRate: parseFloat(efForm.savingsAccountRate),
        projectionYears: parseInt(efForm.projectionYears),
        customInflationRate: efForm.customInflationRate ? parseFloat(efForm.customInflationRate) : undefined,
      });
      setEfResult(r.data.data);
    } catch (e) { console.error(e); }
    setEfLoading(false);
  }, [efForm]);

  const runInflationSim = useCallback(async () => {
    setSimLoading(true);
    try {
      const r = await api.post('/inflation/simulate', {
        inflationScenario: simForm.inflationScenario,
        customRate: simForm.customRate ? parseFloat(simForm.customRate) : undefined,
        years: parseInt(simForm.years),
      });
      setSimResult(r.data.data);
    } catch (e) { console.error(e); }
    setSimLoading(false);
  }, [simForm]);

  // ── Render helpers ──────────────────────────────────────────────────────────
  const currentRate = cpiData?.rate ?? '—';
  const rateColor = typeof currentRate === 'number'
    ? currentRate > 6 ? 'var(--red)' : currentRate > 4 ? 'var(--gold)' : 'var(--green)'
    : 'var(--text-3)';

  return (
    <div style={{ padding: '28px 28px 48px' }}>
      <PageHeader
        title="📈 Inflation Intelligence"
        subtitle="Live CPI tracking, inflation-adjusted goals, and purchasing power analysis"
      />

      {/* Live CPI Banner */}
      {!cpiLoading && cpiData && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-card)', border: `1px solid ${rateColor}33`, borderRadius: 'var(--r-lg)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 900, color: rateColor }}>{pct(currentRate)}</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>India CPI Inflation</div>
              <SourceBadge source={cpiData.source} month={cpiData.month} />
            </div>
          </div>
          <div style={{ height: 40, width: 1, background: 'var(--border)' }} />
          <div style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 320 }}>
            RBI target: <strong style={{ color: 'var(--text)' }}>4% ± 2%</strong> · Current rate is{' '}
            <strong style={{ color: rateColor }}>
              {currentRate < 2 ? 'below target band' : currentRate <= 6 ? 'within target band' : 'above target band'}
            </strong>
          </div>
        </motion.div>
      )}

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: tab === t.id ? 'var(--bg-card)' : 'transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-3)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── TAB: LIVE CPI ─────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {cpiLoading && <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 40 }}>Fetching live CPI data...</div>}
            {!cpiLoading && cpiData && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12, marginBottom: 24 }}>
                  <StatCard label="Current CPI (YoY)" value={pct(cpiData.rate)} color={rateColor} icon="📊" delay={0} sub={`As of ${cpiData.month}`} />
                  <StatCard label="RBI Target" value="4.0%" color="var(--blue)" icon="🏦" delay={0.05} sub="± 2% tolerance band" />
                  <StatCard label="Gap from Target" value={pct(Math.abs(cpiData.rate - 4))} color={Math.abs(cpiData.rate - 4) < 2 ? 'var(--green)' : 'var(--red)'} icon="📐" delay={0.1} sub={cpiData.rate > 4 ? 'above target' : 'below target'} />
                  <StatCard label="Data Source" value="MoSPI" color="var(--teal)" icon="🇮🇳" delay={0.15} sub={`via data.gov.in · ${cpiData.source}`} />
                </div>

                {cpiData.historical?.length > 0 && (
                  <div className="card">
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>CPI Trend — Last 13 Months</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>India headline inflation (year-on-year %)</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={cpiData.historical} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                        <defs>
                          <linearGradient id="cpiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={rateColor} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={rateColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} domain={[0, 'auto']} />
                        <Tooltip content={<ChartTooltip prefix="" />} />
                        <ReferenceLine y={4} stroke="var(--blue)" strokeDasharray="4 3" label={{ value: 'RBI 4%', fill: 'var(--blue)', fontSize: 10 }} />
                        <ReferenceLine y={2} stroke="var(--green)" strokeDasharray="4 3" label={{ value: '2%', fill: 'var(--green)', fontSize: 10 }} />
                        <ReferenceLine y={6} stroke="var(--red)" strokeDasharray="4 3" label={{ value: '6%', fill: 'var(--red)', fontSize: 10 }} />
                        <Area type="monotone" dataKey="rate" stroke={rateColor} fill="url(#cpiGrad)" strokeWidth={2} dot={{ fill: rateColor, r: 3 }} name="CPI %" />
                      </AreaChart>
                    </ResponsiveContainer>

                    <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--text)' }}>What this means for you: </strong>
                      At {pct(cpiData.rate)} inflation, ₹1,00,000 today will require{' '}
                      <strong style={{ color: rateColor }}>₹{fmt(100000 * Math.pow(1 + cpiData.rate / 100, 5))}</strong> in 5 years to buy the same things.
                      Your savings need to beat this rate to grow in real terms.
                    </div>
                  </div>
                )}
              </>
            )}
            {!cpiLoading && !cpiData && (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>CPI data unavailable</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>Using built-in fallback rate (4%). Check your internet connection.</div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: GOAL PLANNER ─────────────────────────────────────────────── */}
        {tab === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>

              {/* Input form */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🎯 Set Your Goal</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See the real future cost adjusted for inflation</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={goalForm.goalName} onChange={e => setGoalForm({ ...goalForm, goalName: e.target.value })}>
                      <option value="">Select category…</option>
                      {GOAL_CATEGORIES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Amount Today (₹)</label>
                    <input className="form-input" type="number" placeholder="e.g. 5000000" value={goalForm.nominalTarget} onChange={e => setGoalForm({ ...goalForm, nominalTarget: e.target.value })} />
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>What this goal costs in today's money</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years to Goal</label>
                    <input className="form-input" type="number" placeholder="e.g. 10" min="1" max="40" value={goalForm.yearsToGoal} onChange={e => setGoalForm({ ...goalForm, yearsToGoal: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Expected Return (%)</label>
                      <input className="form-input" type="number" placeholder="7" value={goalForm.expectedReturn} onChange={e => setGoalForm({ ...goalForm, expectedReturn: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custom Inflation (%)</label>
                      <input className="form-input" type="number" placeholder={`Live: ${cpiData?.rate ?? '4'}%`} value={goalForm.customInflationRate} onChange={e => setGoalForm({ ...goalForm, customInflationRate: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary w-full" onClick={runGoalPlanner} disabled={goalLoading || !goalForm.nominalTarget || !goalForm.yearsToGoal}>
                    {goalLoading ? <><span className="spinner" /> Calculating…</> : '▶ Calculate Inflation-Adjusted Goal'}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!goalResult && (
                  <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Enter your goal details</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>See the true cost of your goals after inflation erodes purchasing power</div>
                  </div>
                )}
                {goalResult && (
                  <>
                    {/* Cost Breakdown */}
                    <div className="card">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>💰 Inflation-Adjusted Cost</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Today's Cost</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>₹{fmt(goalResult.nominalTarget)}</div>
                        </div>
                        <div style={{ background: 'var(--red)10', border: '1px solid var(--red)30', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Future Cost ({goalResult.years}yr)</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--red)' }}>₹{fmt(goalResult.inflationAdjustedTarget)}</div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Inflation Premium</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)' }}>+₹{fmt(goalResult.inflationPremium)}</span>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Real Return (after inflation)</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: clr(goalResult.realReturnRate) }}>{pct(goalResult.realReturnRate)}</span>
                      </div>
                      <div style={{ background: 'var(--gold)15', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gold)30', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Monthly SIP (Nominal)</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-2)' }}>₹{fmt(goalResult.nominalSIP)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Monthly SIP (Inflation-Adj.)</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)' }}>₹{fmt(goalResult.realSIP)}</div>
                        </div>
                      </div>
                      {goalResult.extraSIPNeeded > 0 && (
                        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--red)10', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--red)' }}>
                          You need <strong style={{ color: 'var(--red)' }}>₹{fmt(goalResult.extraSIPNeeded)}/month extra</strong> vs a non-inflation estimate.
                        </div>
                      )}
                      <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--gold)' }}>
                        {goalResult.insight}
                      </div>
                    </div>

                    {/* Projection chart */}
                    {goalResult.projection?.length > 0 && (
                      <div className="card">
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Accumulation vs Inflation-Adjusted Target</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={goalResult.projection} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} label={{ value: 'Year', position: 'insideBottom', fill: 'var(--text-3)', fontSize: 10 }} />
                            <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="sipAccumulated" stroke="var(--gold)" strokeWidth={2} dot={false} name="SIP Accumulated" />
                            <Line type="monotone" dataKey="nominalCost" stroke="var(--red)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Inflation-Adj. Cost" />
                          </LineChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: 'var(--gold)' }} /><span>Your SIP corpus</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: 'var(--red)', borderTop: '2px dashed var(--red)' }} /><span>Goal cost (inflation-adj.)</span></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: EMERGENCY FUND ───────────────────────────────────────────── */}
        {tab === 'emergency' && (
          <motion.div key="emergency" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>

              {/* Input */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🛡️ Analyse Your Emergency Fund</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See how much purchasing power you lose keeping cash idle</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Emergency Fund Amount (₹)</label>
                    <input className="form-input" type="number" placeholder="e.g. 150000" value={efForm.emergencyFundAmount} onChange={e => setEfForm({ ...efForm, emergencyFundAmount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Savings Account Rate (%)</label>
                    <input className="form-input" type="number" placeholder="3.5" value={efForm.savingsAccountRate} onChange={e => setEfForm({ ...efForm, savingsAccountRate: e.target.value })} />
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Typical: SBI 2.7%, HDFC 3%, IDFC 7%</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Projection (years)</label>
                      <input className="form-input" type="number" placeholder="5" min="1" max="10" value={efForm.projectionYears} onChange={e => setEfForm({ ...efForm, projectionYears: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custom Inflation (%)</label>
                      <input className="form-input" type="number" placeholder={`Live: ${cpiData?.rate ?? '4'}%`} value={efForm.customInflationRate} onChange={e => setEfForm({ ...efForm, customInflationRate: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary w-full" onClick={runEFErosion} disabled={efLoading || !efForm.emergencyFundAmount}>
                    {efLoading ? <><span className="spinner" /> Analysing…</> : '▶ Analyse Erosion'}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!efResult && (
                  <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>💸</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Enter your fund details</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Discover the silent cost of keeping money in a low-yield savings account</div>
                  </div>
                )}
                {efResult && (
                  <>
                    {/* Alert banner */}
                    <div style={{ padding: '14px 18px', background: efResult.isEroding ? 'var(--red)12' : 'var(--gold)12', border: `1px solid ${efResult.isEroding ? 'var(--red)' : 'var(--gold)'}40`, borderRadius: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                      {efResult.alert}
                    </div>

                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Fund Today</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text)' }}>₹{fmt(efResult.emergencyFundAmount)}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Real Value ({efResult.projectionYears}yr)</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--red)' }}>₹{fmt(efResult.summary.valueAfterYears)}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Purchasing Power Lost</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--red)' }}>₹{fmt(efResult.summary.purchasingPowerLoss)}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Real Return Rate</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: clr(efResult.realReturnRate) }}>{pct(efResult.realReturnRate)}/yr</div>
                      </div>
                    </div>

                    {/* Erosion chart */}
                    <div className="card">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Purchasing Power Over Time</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={efResult.yearlyErosion} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} label={{ value: 'Year', fill: 'var(--text-3)', fontSize: 10 }} />
                          <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="realValue" fill="var(--teal)" name="Real Value" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="nominalValue" fill="var(--bg-elevated)" name="Nominal Value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--teal)' }} /><span>Real purchasing power</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} /><span>Nominal (with interest)</span></div>
                      </div>
                    </div>

                    {/* Alternative */}
                    {efResult.alternativeLiquidFund && (
                      <div className="card" style={{ borderColor: 'var(--green)30', background: 'var(--green)08' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--green)' }}>💡 Better Alternative: Liquid Mutual Fund</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, fontSize: 13 }}>
                          <div>
                            <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Expected Rate</div>
                            <div style={{ fontWeight: 700 }}>{efResult.alternativeLiquidFund.rate}%</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Real Return</div>
                            <div style={{ fontWeight: 700, color: 'var(--green)' }}>{pct(efResult.alternativeLiquidFund.realReturn)}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase' }}>Extra Preserved</div>
                            <div style={{ fontWeight: 700, color: 'var(--green)' }}>+₹{fmt(efResult.alternativeLiquidFund.extraPreserved)}</div>
                          </div>
                        </div>
                        {efResult.suggestions?.length > 0 && (
                          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)' }}>
                            Try: {efResult.suggestions[0].platforms.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: INFLATION WHAT-IF ────────────────────────────────────────── */}
        {tab === 'simulate' && (
          <motion.div key="simulate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>

              {/* Input */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>⚡ Inflation Scenarios</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>See how different inflation environments affect your financial health score</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Scenario picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { id: 'low',      icon: '🌿', label: 'Low (2.5%)',     sub: 'Below RBI target band' },
                      { id: 'moderate', icon: '📊', label: `Live (${cpiData?.rate?.toFixed(2) ?? '4'}%)`,  sub: 'Current MoSPI CPI' },
                      { id: 'high',     icon: '🔥', label: 'High (7.5%)',    sub: 'Above RBI tolerance' },
                      { id: 'custom',   icon: '✏️', label: 'Custom rate',    sub: 'Enter your own' },
                    ].map(s => (
                      <button key={s.id} onClick={() => setSimForm({ ...simForm, inflationScenario: s.id })}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: `1px solid ${simForm.inflationScenario === s.id ? 'var(--gold)' : 'var(--border)'}`, background: simForm.inflationScenario === s.id ? 'var(--gold-dim)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: simForm.inflationScenario === s.id ? 'var(--gold)' : 'var(--text)' }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {simForm.inflationScenario === 'custom' && (
                    <div className="form-group">
                      <label className="form-label">Custom Inflation Rate (%)</label>
                      <input className="form-input" type="number" placeholder="e.g. 5.5" value={simForm.customRate} onChange={e => setSimForm({ ...simForm, customRate: e.target.value })} />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Projection Period (years)</label>
                    <input className="form-input" type="number" placeholder="3" min="1" max="10" value={simForm.years} onChange={e => setSimForm({ ...simForm, years: e.target.value })} />
                  </div>

                  <button className="btn btn-primary w-full" onClick={runInflationSim} disabled={simLoading}>
                    {simLoading ? <><span className="spinner" /> Running…</> : '▶ Run Inflation Simulation'}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!simResult && (
                  <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Choose an inflation scenario</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Understand how inflation silently erodes your financial health score over time</div>
                  </div>
                )}
                {simResult && (
                  <>
                    {/* Score impact */}
                    <div className="card">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>
                        {simResult.scenario.label} · {simResult.scenario.rate}% Inflation
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Current Score</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>{simResult.baseMetrics.currentScore}</div>
                        </div>
                        <div style={{ background: simResult.summary.scoreDelta < -5 ? 'var(--red)10' : 'var(--gold)10', border: `1px solid ${simResult.summary.scoreDelta < -5 ? 'var(--red)' : 'var(--gold)'}30`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Projected Score ({simResult.summary.yearsSimulated}yr)</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: simResult.summary.scoreDelta < -5 ? 'var(--red)' : 'var(--gold)' }}>{simResult.summary.finalScore}</div>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Score Change</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: clr(simResult.summary.scoreDelta) }}>
                            {simResult.summary.scoreDelta >= 0 ? '+' : ''}{simResult.summary.scoreDelta}
                          </div>
                        </div>
                      </div>

                      {/* Income squeeze breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Real Income Squeeze</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>-₹{fmt(simResult.summary.incomeSqueeze)}/mo</span>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Expense Growth</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>+₹{fmt(simResult.summary.expenseGrowth)}/mo</span>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Savings Rate Change</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: clr(simResult.summary.savingsRateChange) }}>{simResult.summary.savingsRateChange >= 0 ? '+' : ''}{pct(simResult.summary.savingsRateChange)}</span>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Current Savings Rate</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>{pct(simResult.baseMetrics.savingsRate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Projection chart */}
                    <div className="card">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Year-by-Year Projection</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={simResult.projections} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                          <YAxis yAxisId="score" domain={[0, 100]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                          <YAxis yAxisId="income" orientation="right" tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                          <Tooltip content={<ChartTooltip prefix="" />} />
                          <Line yAxisId="score" type="monotone" dataKey="simulatedScore" stroke="var(--gold)" strokeWidth={2} dot={{ fill: 'var(--gold)', r: 4 }} name="Score" />
                          <Line yAxisId="income" type="monotone" dataKey="realIncome" stroke="var(--teal)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Real Income" />
                          <Line yAxisId="income" type="monotone" dataKey="inflatedExpenses" stroke="var(--red)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Expenses" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Action plan */}
                    {simResult.recommendedActions?.length > 0 && (
                      <div className="card">
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>🛡️ How to Defend Against Inflation</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {simResult.recommendedActions.map((a, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 9, fontSize: 13, color: 'var(--text-2)', borderLeft: '3px solid var(--gold)' }}>
                              <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}