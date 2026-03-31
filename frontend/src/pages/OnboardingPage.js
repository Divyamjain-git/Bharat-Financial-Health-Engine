import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProfile, updateProfile, fetchProfile, addLoan } from '../store/slices/profileSlice';
import { updateUser } from '../store/slices/authSlice';

const STEPS = ['Income', 'Expenses', 'Savings & Credit', 'Loans', 'Review'];

const toStr = (v) => (v && v !== 0 ? String(v) : '');

const OnboardingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { profile, loans: existingLoans, loading, error } = useSelector((s) => s.profile);
  const isBusiness = user?.role === 'business';
  const isUpdate = !!profile;

  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState({
    netMonthlySalary: '', annualBonus: '', otherMonthlyIncome: '',
    avgMonthlyProfit: '',
    last12MonthRevenue: Array(12).fill(''),
    expenses: {
      houseRent: '', groceries: '', electricityBill: '', gasBill: '',
      waterBill: '', internetMobile: '', medicalExpenses: '',
      vehicleFuel: '', schoolFees: '', otherExpenses: ''
    },
    emergencyFundAmount: '',
    creditCards: [{ cardName: '', creditLimit: '', outstandingBalance: '' }],
    monthlySavings: ''
  });
  const [loans, setLoans] = useState([]);
  const [newLoan, setNewLoan] = useState({
    loanType: 'personal', lenderName: '', principalAmount: '',
    outstandingBalance: '', monthlyEMI: '', interestRate: ''
  });

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    const rev = profile.last12MonthRevenue || [];
    const filledRevenue = Array(12).fill('').map((_, i) => toStr(rev[i]));
    const existingCards = profile.creditCards && profile.creditCards.length > 0
      ? profile.creditCards.map(c => ({ cardName: c.cardName || '', creditLimit: toStr(c.creditLimit), outstandingBalance: toStr(c.outstandingBalance) }))
      : [{ cardName: '', creditLimit: '', outstandingBalance: '' }];
    const e = profile.expenses || {};
    setProfileData({
      netMonthlySalary: toStr(profile.netMonthlySalary),
      annualBonus: toStr(profile.annualBonus),
      otherMonthlyIncome: toStr(profile.otherMonthlyIncome),
      avgMonthlyProfit: toStr(profile.avgMonthlyProfit),
      last12MonthRevenue: filledRevenue,
      expenses: {
        houseRent: toStr(e.houseRent), groceries: toStr(e.groceries),
        electricityBill: toStr(e.electricityBill), gasBill: toStr(e.gasBill),
        waterBill: toStr(e.waterBill), internetMobile: toStr(e.internetMobile),
        medicalExpenses: toStr(e.medicalExpenses), vehicleFuel: toStr(e.vehicleFuel),
        schoolFees: toStr(e.schoolFees), otherExpenses: toStr(e.otherExpenses)
      },
      emergencyFundAmount: toStr(profile.emergencyFundAmount),
      creditCards: existingCards,
      monthlySavings: toStr(profile.monthlySavings)
    });
    if (existingLoans && existingLoans.length > 0) {
      setLoans(existingLoans.map(l => ({
        loanType: l.loanType, lenderName: l.lenderName || '',
        principalAmount: toStr(l.principalAmount), outstandingBalance: toStr(l.outstandingBalance),
        monthlyEMI: toStr(l.monthlyEMI), interestRate: toStr(l.interestRate), _id: l._id
      })));
    }
  }, [profile, existingLoans]);

  const numVal = (v) => parseFloat(v) || 0;

  const handleSubmit = async () => {
    const expenses = {};
    for (const key in profileData.expenses) {
      expenses[key] = numVal(profileData.expenses[key]);
    }
    const creditCards = profileData.creditCards
      .filter(c => c.creditLimit)
      .map(c => ({ cardName: c.cardName || 'Credit Card', creditLimit: numVal(c.creditLimit), outstandingBalance: numVal(c.outstandingBalance) }));
    const data = {
      netMonthlySalary: numVal(profileData.netMonthlySalary),
      annualBonus: numVal(profileData.annualBonus),
      otherMonthlyIncome: numVal(profileData.otherMonthlyIncome),
      avgMonthlyProfit: numVal(profileData.avgMonthlyProfit),
      last12MonthRevenue: profileData.last12MonthRevenue.map(v => numVal(v)).filter(v => v > 0),
      expenses, emergencyFundAmount: numVal(profileData.emergencyFundAmount),
      creditCards, monthlySavings: numVal(profileData.monthlySavings)
    };

    // KEY FIX: PUT if profile exists, POST if new
    const action = isUpdate ? updateProfile : createProfile;
    const result = await dispatch(action(data));
    const succeeded = isUpdate ? updateProfile.fulfilled.match(result) : createProfile.fulfilled.match(result);

    if (succeeded) {
      const newLoans = loans.filter(l => !l._id);
      for (const loan of newLoans) {
        await dispatch(addLoan({ loanType: loan.loanType, lenderName: loan.lenderName,
          principalAmount: numVal(loan.principalAmount), outstandingBalance: numVal(loan.outstandingBalance),
          monthlyEMI: numVal(loan.monthlyEMI), interestRate: numVal(loan.interestRate) }));
      }
      dispatch(updateUser({ isOnboardingComplete: true }));
      navigate('/dashboard');
    }
  };

  const addLoanToList = () => {
    if (!newLoan.monthlyEMI || !newLoan.outstandingBalance) return;
    setLoans([...loans, { ...newLoan }]);
    setNewLoan({ loanType: 'personal', lenderName: '', principalAmount: '', outstandingBalance: '', monthlyEMI: '', interestRate: '' });
  };

  const inp = (label, field, parentKey) => {
    const value = parentKey ? profileData[parentKey][field] : profileData[field];
    const onChange = (e) => {
      if (parentKey) {
        setProfileData({ ...profileData, [parentKey]: { ...profileData[parentKey], [field]: e.target.value } });
      } else {
        setProfileData({ ...profileData, [field]: e.target.value });
      }
    };
    return (
      <div className="form-group" key={field}>
        <label className="form-label">{label}</label>
        <div className="form-input-prefix">
          <input className="form-input" type="number" value={value} onChange={onChange} placeholder="0" min="0" />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div style={S.fields}>
          <p style={S.stepDesc}>{isBusiness ? 'Tell us about your business income' : 'Tell us about your monthly income'}</p>
          {isBusiness ? (
            <>
              {inp('Average Monthly Profit (₹)', 'avgMonthlyProfit')}
              <div className="form-group">
                <label className="form-label">Last 12 Months Revenue (₹)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {Array(12).fill(0).map((_, i) => (
                    <div key={i}>
                      <div style={S.monthLabel}>Month {i + 1}</div>
                      <input className="form-input" type="number" placeholder="0" style={{ fontSize: 13, padding: '10px 12px' }}
                        value={profileData.last12MonthRevenue[i]}
                        onChange={e => { const arr = [...profileData.last12MonthRevenue]; arr[i] = e.target.value; setProfileData({ ...profileData, last12MonthRevenue: arr }); }} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {inp('Net Monthly Salary (₹)', 'netMonthlySalary')}
              {inp('Annual Bonus (₹)', 'annualBonus')}
              {inp('Other Monthly Income (₹)', 'otherMonthlyIncome')}
            </>
          )}
        </div>
      );
      case 1: return (
        <div style={S.fields}>
          <p style={S.stepDesc}>Monthly household expenses</p>
          <div style={S.twoCol}>
            {[['House Rent / EMI','houseRent'],['Groceries','groceries'],['Electricity Bill','electricityBill'],
              ['Gas Bill','gasBill'],['Water Bill','waterBill'],['Internet & Mobile','internetMobile'],
              ['Medical Expenses','medicalExpenses'],['Vehicle Fuel','vehicleFuel'],
              ['School / College Fees','schoolFees'],['Other Expenses','otherExpenses']
            ].map(([label, field]) => inp(label, field, 'expenses'))}
          </div>
        </div>
      );
      case 2: return (
        <div style={S.fields}>
          <p style={S.stepDesc}>Savings and credit card details</p>
          {inp('Emergency Fund Amount (₹)', 'emergencyFundAmount')}
          {inp('Monthly Savings / SIP (₹)', 'monthlySavings')}
          <div style={{ marginTop: 8 }}>
            <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Credit Cards</label>
            {profileData.creditCards.map((card, i) => (
              <div key={i} style={S.cardRow}>
                <input className="form-input" placeholder="Card name" style={{ flex: 1 }} value={card.cardName}
                  onChange={e => { const cards=[...profileData.creditCards]; cards[i]={...cards[i],cardName:e.target.value}; setProfileData({...profileData,creditCards:cards}); }} />
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={S.rupeePfx}>₹</span>
                  <input className="form-input" type="number" placeholder="Credit Limit" style={{ paddingLeft: 28 }} value={card.creditLimit}
                    onChange={e => { const cards=[...profileData.creditCards]; cards[i]={...cards[i],creditLimit:e.target.value}; setProfileData({...profileData,creditCards:cards}); }} />
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={S.rupeePfx}>₹</span>
                  <input className="form-input" type="number" placeholder="Outstanding" style={{ paddingLeft: 28 }} value={card.outstandingBalance}
                    onChange={e => { const cards=[...profileData.creditCards]; cards[i]={...cards[i],outstandingBalance:e.target.value}; setProfileData({...profileData,creditCards:cards}); }} />
                </div>
                {profileData.creditCards.length > 1 && (
                  <button onClick={() => setProfileData({...profileData,creditCards:profileData.creditCards.filter((_,j)=>j!==i)})} style={S.removeCardBtn}>×</button>
                )}
              </div>
            ))}
            <button className="btn btn-secondary" style={{ marginTop: 8, fontSize: 13, padding: '8px 16px' }}
              onClick={() => setProfileData({...profileData,creditCards:[...profileData.creditCards,{cardName:'',creditLimit:'',outstandingBalance:''}]})}>
              + Add Another Card
            </button>
          </div>
        </div>
      );
      case 3: return (
        <div style={S.fields}>
          <p style={S.stepDesc}>{isUpdate ? 'Your existing loans are pre-loaded. Add new ones below.' : 'Add your active loans (optional but recommended)'}</p>
          {loans.length > 0 && (
            <div>
              {loans.map((l, i) => (
                <div key={i} style={S.loanItem}>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 14 }}>
                      {l.loanType} Loan {l._id && <span style={S.existingTag}>existing</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>EMI: ₹{l.monthlyEMI} · Outstanding: ₹{l.outstandingBalance}{l.lenderName ? ` · ${l.lenderName}` : ''}</div>
                  </div>
                  {!l._id && <button onClick={() => setLoans(loans.filter((_,j)=>j!==i))} style={S.removeBtn}>×</button>}
                </div>
              ))}
            </div>
          )}
          <div style={S.loanForm}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 2 }}>+ Add New Loan</div>
            <div className="form-group">
              <label className="form-label">Loan Type</label>
              <select className="form-input" value={newLoan.loanType} onChange={e => setNewLoan({...newLoan,loanType:e.target.value})} style={{ cursor:'pointer', background:'var(--bg-elevated)' }}>
                {['personal','home','vehicle','education','business','gold','other'].map(t=>(
                  <option key={t} value={t} style={{ background:'#0D1421' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lender Name (optional)</label>
              <input className="form-input" placeholder="HDFC / SBI / etc." value={newLoan.lenderName} onChange={e => setNewLoan({...newLoan,lenderName:e.target.value})} />
            </div>
            <div style={S.twoCol}>
              {[['Outstanding Balance (₹)','outstandingBalance',true],['Monthly EMI (₹)','monthlyEMI',true],['Interest Rate (%)','interestRate',false],['Principal Amount (₹)','principalAmount',true]].map(([label,field,pfx])=>(
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <div style={pfx?{position:'relative'}:{}}>
                    {pfx && <span style={S.rupeePfx}>₹</span>}
                    <input className="form-input" type="number" placeholder="0" style={pfx?{paddingLeft:28}:{}} value={newLoan[field]} onChange={e => setNewLoan({...newLoan,[field]:e.target.value})} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={addLoanToList} style={{ width: '100%' }}>+ Add Loan to List</button>
          </div>
        </div>
      );
      case 4: return (
        <div style={S.fields}>
          <p style={S.stepDesc}>{isUpdate ? 'Review your updated info — score will be recalculated instantly' : 'Review before calculating your score'}</p>
          <div style={S.reviewGrid}>
            {[
              { label: 'Monthly Income', value: isBusiness ? `₹${Number(profileData.avgMonthlyProfit||0).toLocaleString('en-IN')}` : `₹${Number(profileData.netMonthlySalary||0).toLocaleString('en-IN')}` },
              { label: 'Annual Bonus', value: `₹${Number(profileData.annualBonus||0).toLocaleString('en-IN')}` },
              { label: 'Total Expenses', value: `₹${Object.values(profileData.expenses).reduce((s,v)=>s+(parseFloat(v)||0),0).toLocaleString('en-IN')}` },
              { label: 'Emergency Fund', value: `₹${Number(profileData.emergencyFundAmount||0).toLocaleString('en-IN')}` },
              { label: 'Credit Cards', value: `${profileData.creditCards.filter(c=>c.creditLimit).length} card(s)` },
              { label: 'Active Loans', value: `${loans.length} loan(s)` }
            ].map(item => (
              <div key={item.label} style={S.reviewItem}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bgOrb} />
      <div style={S.container} className="animate-fade-up">
        <div style={S.header}>
          <div style={S.logoIcon}>₹</div>
          <div>
            <h1 style={S.title}>{isUpdate ? 'Update Financial Profile' : 'Financial Onboarding'}</h1>
            <p style={S.subtitle}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
        <div style={S.progressTrack}>
          <div style={{ ...S.progressFill, width: `${((step+1)/STEPS.length)*100}%` }} />
        </div>
        <div style={S.steps}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ ...S.stepDot, ...(i<=step?S.stepDotActive:{}) }}>
              <div style={S.stepNum}>{i<step?'✓':i+1}</div>
              <div style={S.stepName}>{s}</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h2 style={S.stepTitle}>{STEPS[step]}</h2>
          {renderStep()}
        </div>
        <div style={S.nav}>
          {step > 0
            ? <button className="btn btn-secondary" onClick={() => setStep(step-1)}>← Back</button>
            : <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Dashboard</button>}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1
            ? <button className="btn btn-primary" onClick={() => setStep(step+1)}>Continue →</button>
            : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" />Saving...</> : isUpdate ? '💾 Save & Recalculate' : '🎯 Calculate My Score'}
              </button>}
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'32px 24px', background:'var(--bg-deep)', position:'relative', overflow:'hidden' },
  bgOrb: { position:'fixed', top:'20%', right:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)', pointerEvents:'none' },
  container: { width:'100%', maxWidth:660, position:'relative', zIndex:1 },
  header: { display:'flex', alignItems:'center', gap:16, marginBottom:24 },
  logoIcon: { width:52, height:52, borderRadius:14, background:'linear-gradient(135deg, var(--accent-gold), #E8920A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, color:'#070B14', fontFamily:'var(--font-display)', flexShrink:0 },
  title: { fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:2 },
  subtitle: { fontSize:14, color:'var(--text-secondary)' },
  progressTrack: { height:4, background:'var(--border)', borderRadius:2, marginBottom:24, overflow:'hidden' },
  progressFill: { height:'100%', background:'linear-gradient(90deg, var(--accent-gold), #E8920A)', borderRadius:2, transition:'width 0.4s ease' },
  steps: { display:'flex', gap:4, marginBottom:24, overflowX:'auto', paddingBottom:4 },
  stepDot: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1, minWidth:60, opacity:0.4, transition:'opacity 0.2s' },
  stepDotActive: { opacity:1 },
  stepNum: { width:28, height:28, borderRadius:'50%', background:'var(--accent-gold)', color:'#d7dbe5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 },
  stepName: { fontSize:11, color:'var(--text-secondary)', textAlign:'center', whiteSpace:'nowrap' },
  card: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:'28px 24px', marginBottom:16 },
  stepTitle: { fontSize:20, fontWeight:800, marginBottom:4, color:'var(--text-primary)' },
  stepDesc: { fontSize:14, color:'var(--text-secondary)', marginBottom:20 },
  fields: { display:'flex', flexDirection:'column', gap:16 },
  twoCol: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 },
  nav: { display:'flex', gap:12, alignItems:'center' },
  cardRow: { display:'flex', gap:8, marginBottom:8, alignItems:'center', flexWrap:'wrap' },
  removeCardBtn: { background:'none', border:'none', color:'var(--accent-red)', fontSize:20, cursor:'pointer', padding:'0 4px' },
  rupeePfx: { position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)', fontWeight:600, pointerEvents:'none', zIndex:1 },
  loanForm: { display:'flex', flexDirection:'column', gap:14, background:'var(--bg-elevated)', borderRadius:12, padding:16, border:'1px solid var(--border-subtle)' },
  loanItem: { background:'var(--bg-elevated)', borderRadius:10, padding:'12px 16px', marginBottom:8, border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' },
  removeBtn: { background:'none', border:'none', color:'var(--accent-red)', fontSize:20, cursor:'pointer', lineHeight:1, padding:'0 4px', flexShrink:0 },
  existingTag: { fontSize:10, background:'rgba(59,130,246,0.15)', color:'#3B82F6', padding:'1px 6px', borderRadius:4, marginLeft:6, fontWeight:600, textTransform:'uppercase', letterSpacing:0.3, fontFamily:'var(--font-body)' },
  reviewGrid: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 },
  reviewItem: { background:'var(--bg-elevated)', borderRadius:10, padding:'14px 16px', border:'1px solid var(--border)' },
  monthLabel: { fontSize:10, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase' }
};

export default OnboardingPage;
