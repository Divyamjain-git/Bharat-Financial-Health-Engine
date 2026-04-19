import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../services/api';
import { PageHeader, InfoBox } from '../components/ui';
import { formatINR, getScoreColor } from '../utils/currency';

const SCENARIOS = [
  { id:'salary_hike',    icon:'💰', label:'Salary Hike',          desc:'What if your income increases?' },
  { id:'pay_loan',       icon:'🏦', label:'Pay Off a Loan',        desc:'Remove an EMI from your burden' },
  { id:'cut_expenses',   icon:'✂️', label:'Cut Expenses',          desc:'Reduce monthly spending' },
  { id:'emergency_fund', icon:'🛡️', label:'Build Emergency Fund',  desc:'Add months to your safety net' },
  { id:'reduce_credit',  icon:'💳', label:'Pay Off Credit Card',   desc:'Lower credit utilization' },
];

export default function SimulationPage() {
  // Bug 1 fixed: s.score.latest is the score object directly — it has no .metrics sub-key
  const score = useSelector(s => s.score.latest);

  // Bug 2 fixed: score fields are top-level (monthlyIncome, savingsRate, etc.)
  const metrics = score ? {
    monthlyIncome:       score.monthlyIncome       || 0,
    totalMonthlyEMI:     score.totalMonthlyEMI     || 0,
    totalMonthlyExpenses:score.totalMonthlyExpenses|| 0,
    savingsRate:         score.savingsRate         || 0,
    dtiRatio:            score.dtiRatio            || 0,
    creditUtilization:   score.creditUtilization   || 0,
    emergencyFundMonths: score.emergencyFundMonths  || 0,
  } : {};

  const [activeScenario, setActiveScenario] = useState(null);
  const [inputValue, setInputValue]         = useState('');
  const [result, setResult]                 = useState(null);
  const [insights, setInsights]             = useState(null);
  const [peerData, setPeerData]             = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    // Bug 3 fixed: insights response shape is r.data.data (not r.data.data.insights)
    api.get('/simulation/insights').then(r => setInsights(r.data.data)).catch(() => {});
    api.get('/simulation/peer-comparison').then(r => setPeerData(r.data.data)).catch(() => {});
  }, []);

  const runSim = async () => {
    // Bug 4 fixed: guard — can't simulate without a score
    if (!score) { setError('Complete your financial profile first to run simulations.'); return; }
    const val = parseFloat(inputValue) || 0;
    const payload = { incomeChange:0, emiChange:0, expenseChange:0, emergencyChange:0, creditChange:0 };
    if (activeScenario === 'salary_hike')    payload.incomeChange    =  val;
    if (activeScenario === 'pay_loan')       payload.emiChange       = -val;
    if (activeScenario === 'cut_expenses')   payload.expenseChange   = -val;
    if (activeScenario === 'emergency_fund') payload.emergencyChange =  val;
    if (activeScenario === 'reduce_credit')  payload.creditChange    = -val;
    setLoading(true); setError(null);
    try {
      const r = await api.post('/simulation/run', { changes: payload });
      setResult(r.data.data.simulation);
    } catch(e) {
      setError(e.response?.data?.message || 'Simulation failed. Please try again.');
    }
    setLoading(false);
  };

  const selectScenario = (s) => {
    setActiveScenario(s.id);
    setResult(null);
    setInputValue('');
    setError(null);
  };

  // Bug 5 fixed: getScoreColor needs grade string — score.grade is correct
  const simColor  = result ? getScoreColor(result.simulatedGrade) : 'var(--gold)';
  const origColor = score  ? getScoreColor(score.grade)           : 'var(--text-3)';

  // Bug 6 fixed: peerData.userMetrics doesn't include creditUtilization from API —
  // fall back to score.creditUtilization for the radar chart
  const radarData = peerData ? [
    { metric:'Score',     user: peerData.userScore,                                              peer: peerData.peers.avgScore },
    { metric:'Savings',   user: Math.min(50, peerData.userMetrics.savingsRate),                  peer: Math.min(50, peerData.peers.avgSavings) },
    { metric:'Low DTI',   user: Math.max(0, 100-peerData.userMetrics.dtiRatio),                  peer: Math.max(0, 100-peerData.peers.avgDTI) },
    { metric:'Emergency', user: Math.min(100,(peerData.userMetrics.emergencyFundMonths/6)*100),   peer: Math.min(100,(peerData.peers.avgEmergency/6)*100) },
    { metric:'Credit',    user: Math.max(0, 100-(score?.creditUtilization || 0)),                peer: Math.max(0, 100-30) },
  ] : [];

  const inputLabel = {
    salary_hike:    { label:'Extra Monthly Income (₹)',         hint:`Current: ${formatINR(metrics.monthlyIncome)}/mo`,          placeholder:'e.g. 10000' },
    pay_loan:       { label:'EMI to Remove (₹/month)',          hint:`Current total EMI: ${formatINR(metrics.totalMonthlyEMI)}/mo`, placeholder:'e.g. 5000' },
    cut_expenses:   { label:'Monthly Expense Reduction (₹)',    hint:`Current expenses: ${formatINR(metrics.totalMonthlyExpenses)}/mo`, placeholder:'e.g. 5000' },
    emergency_fund: { label:'Additional Months of Coverage',    hint:`Current coverage: ${(metrics.emergencyFundMonths||0).toFixed(1)} months`, placeholder:'e.g. 3' },
    reduce_credit:  { label:'Credit Utilization Reduction (%)', hint:`Current: ${(metrics.creditUtilization||0).toFixed(1)}%`, placeholder:'e.g. 20' },
  }[activeScenario] || {};

  return (
    <div style={{ padding:'28px 28px 48px' }}>
      <PageHeader title="⟳ Financial Simulator" subtitle="Run 'what-if' scenarios and discover the impact on your financial health score"/>

      {/* Guard: no score yet */}
      {!score && (
        <div style={{ marginBottom:20 }}>
          <InfoBox type="warn">⚠️ You need to complete your financial profile and calculate your score before running simulations.</InfoBox>
        </div>
      )}

      {/* Score Insights — Bug 3 fix: insights object has .insights array */}
      {insights?.insights?.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:24 }}>
          {insights.insights.map((ins,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:800,
                color:ins.type==='strength'?'var(--green)':ins.type==='weakness'?'var(--red)':'var(--blue)',
                textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>
                {ins.type==='strength'?'💪 Strength':ins.type==='weakness'?'⚠️ Focus Area':'📊 Trend'}
              </div>
              <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>{ins.message}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Left — Scenario picker + controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card">
            <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, marginBottom:4 }}>Choose a Scenario</div>
            <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>Select a financial change to simulate its impact on your score</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SCENARIOS.map(s=>(
                <button key={s.id} onClick={()=>selectScenario(s)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
                    border:`1px solid ${activeScenario===s.id?'var(--gold)':'var(--border)'}`,
                    background:activeScenario===s.id?'var(--gold-dim)':'var(--bg-elevated)',
                    cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left', transition:'all 0.15s' }}>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:activeScenario===s.id?'var(--gold)':'var(--text)' }}>{s.label}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          {activeScenario && (
            <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} className="card">
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, marginBottom:14 }}>Adjust Parameters</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">{inputLabel.label}</label>
                  <input className="form-input" type="number" placeholder={inputLabel.placeholder}
                    value={inputValue} onChange={e=>setInputValue(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter') runSim(); }}/>
                  <span style={{ fontSize:11, color:'var(--text-3)' }}>{inputLabel.hint}</span>
                </div>
                {error && <div style={{ fontSize:13, color:'var(--red)', padding:'8px 12px', background:'var(--red-dim)', borderRadius:8 }}>{error}</div>}
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={runSim} disabled={loading || !score}>
                  {loading?<><span className="spinner"/>Running Simulation...</>:'▶ Run Simulation'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right — Results + Peer Comparison */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Simulation Result */}
          {result && (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="card">
              <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, marginBottom:16 }}>📊 Simulation Result</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                <div style={{ background:'var(--bg-elevated)', borderRadius:10, padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Current Score</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:900, color:origColor }}>{result.originalScore}</div>
                </div>
                <div style={{ background:simColor+'10', borderRadius:10, padding:'14px', textAlign:'center', border:`1px solid ${simColor}30` }}>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Simulated Score</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:900, color:simColor }}>{result.simulatedScore}</div>
                </div>
              </div>
              <div style={{ textAlign:'center', marginBottom:14 }}>
                <span style={{ fontSize:20, fontWeight:900, color:result.scoreDiff>=0?'var(--green)':'var(--red)' }}>
                  {result.scoreDiff>=0?'▲ +':'▼ '}{result.scoreDiff} points
                </span>
                <span style={{ marginLeft:10, fontSize:14, color:'var(--text-2)' }}>→ {result.simulatedGrade}</span>
              </div>
              {result.insights?.length>0&&(
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {result.insights.map((ins,i)=>(
                    <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'var(--text-2)', borderLeft:`3px solid ${simColor}` }}>{ins}</div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Peer Comparison */}
          {peerData && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card">
              <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, marginBottom:4 }}>👥 Peer Comparison</div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:14 }}>vs. {peerData.peers.label} income group</div>
              <div style={{ textAlign:'center', marginBottom:12 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'var(--gold)' }}>Top {100-peerData.percentile}%</span>
                <span style={{ fontSize:13, color:'var(--text-2)', marginLeft:8 }}>of your income group</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                  <PolarAngleAxis dataKey="metric" tick={{fill:'var(--text-3)',fontSize:11}}/>
                  <Radar name="You"   dataKey="user" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.15} strokeWidth={2}/>
                  <Radar name="Peers" dataKey="peer" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 2"/>
                  <Tooltip contentStyle={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:6, fontSize:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10,height:2,background:'var(--gold)' }}/><span>You</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10,height:2,background:'var(--blue)' }}/><span>Peers avg</span></div>
              </div>
              {/* Comparison Table */}
              <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
                {Object.entries(peerData.comparison).map(([key,v])=>(
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                    <span style={{ color:'var(--text-2)', textTransform:'capitalize' }}>{key==='dti'?'DTI Ratio':key}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:700 }}>{typeof v.user==='number'?v.user.toFixed(1):v.user}</span>
                      <span style={{ color:'var(--text-3)' }}>vs {typeof v.peer==='number'?v.peer.toFixed(1):v.peer}</span>
                      <span>{v.better?'✅':'⚠️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!activeScenario && !result && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="card" style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>⟳</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, marginBottom:6 }}>Choose a Scenario</div>
              <div style={{ fontSize:14, color:'var(--text-2)' }}>Select a scenario from the left to see how changes would affect your financial health score</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}