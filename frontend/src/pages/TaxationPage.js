import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import api from '../services/api';
import { PageHeader, StatCard } from '../components/ui';

const fmt = (n) => (n != null && !isNaN(n) ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0');
const pct = (n) => (n != null && !isNaN(n) ? `${Number(n).toFixed(1)}%` : '0%');

export default function TaxationPage() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Form inputs
  const [form, setForm] = useState({
    annualGrossSalary: 1200000,
    isSalaried: true,
    sec80C: 150000,
    sec80D: 25000,
    sec80CCD: 0,
    sec24b: 0,
    hraExemption: 0,
    otherDeductions: 0,
  });

  const [taxData, setTaxData] = useState(null);
  const [showDeductions, setShowDeductions] = useState(true);

  // Fetch initial prefilled summary from user profile
  useEffect(() => {
    setLoading(true);
    api.get('/tax/summary')
      .then(res => {
        if (res.data?.success) {
          const d = res.data.data;
          setTaxData(d);
          if (d.profileData?.annualGross) {
            setForm(prev => ({
              ...prev,
              annualGrossSalary: d.profileData.annualGross,
              sec24b: d.profileData.estimatedHomeLoanInterest || 0,
              hraExemption: Math.round(d.profileData.annualRent * 0.4) || 0,
            }));
          }
        }
      })
      .catch(err => console.error('[Tax] Summary load error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Live recalculate when inputs change
  const handleRecalculate = useCallback(async (updatedForm) => {
    setCalculating(true);
    try {
      const res = await api.post('/tax/calculate', updatedForm);
      if (res.data?.success) {
        setTaxData(prev => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error('[Tax] Recalculate error:', err);
    } finally {
      setCalculating(false);
    }
  }, []);

  const updateField = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    handleRecalculate(updated);
  };

  const activeTakeHome = useMemo(() => {
    return taxData?.takeHome?.recommended || taxData?.takeHome?.newRegime || null;
  }, [taxData]);

  // Comparison chart data
  const chartData = useMemo(() => {
    if (!taxData) return [];
    return [
      {
        name: 'New Regime',
        'Net Take Home': taxData.takeHome?.newRegime?.annual?.netTakeHome || 0,
        'Income Tax': taxData.newRegime?.totalTax || 0,
        'EPF + PT': (taxData.takeHome?.newRegime?.annual?.providentFund || 0) + (taxData.takeHome?.newRegime?.annual?.professionalTax || 0),
      },
      {
        name: 'Old Regime',
        'Net Take Home': taxData.takeHome?.oldRegime?.annual?.netTakeHome || 0,
        'Income Tax': taxData.oldRegime?.totalTax || 0,
        'EPF + PT': (taxData.takeHome?.oldRegime?.annual?.providentFund || 0) + (taxData.takeHome?.oldRegime?.annual?.professionalTax || 0),
      },
    ];
  }, [taxData]);

  return (
    <div style={{ padding: '28px 28px 48px' }}>
      <PageHeader
        title="🏛️ Indian Income Tax & Take-Home Pay"
        subtitle="Union Budget 2025 (FY 2025-26) · Instant New vs Old Regime Comparison"
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          Loading your personalized tax snapshot...
        </div>
      ) : (
        <>
          {/* ── Top Highlight Banner: Budget 2025 Rule ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 142, 247, 0.12), rgba(144, 97, 249, 0.12))',
            border: '1px solid rgba(79, 142, 247, 0.3)',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🇮🇳</span>
              <div>
                <strong style={{ color: 'var(--text)', fontSize: 14 }}>
                  Budget 2025 Tax Rule: Zero Tax Up to ₹12.75 Lakh Gross Salary
                </strong>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                  Salaried individuals get ₹75,000 Standard Deduction + ₹60,000 Section 87A rebate. Income up to ₹12,75,000 pays ₹0 tax!
                </div>
              </div>
            </div>
            <span style={{
              background: 'rgba(49, 196, 141, 0.15)',
              color: 'var(--green)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}>
              FY 2025-26 Active
            </span>
          </div>

          {/* ── Top Metric Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard
              label="Monthly Take-Home"
              value={fmt(activeTakeHome?.monthly?.netTakeHome)}
              sub={`Annual: ${fmt(activeTakeHome?.annual?.netTakeHome)}`}
              color="var(--green)"
              icon="💵"
              delay={0}
            />
            <StatCard
              label="Total Income Tax"
              value={fmt(taxData?.newRegime?.totalTax)}
              sub={`Effective Rate: ${taxData?.newRegime?.effectiveRate}%`}
              color={taxData?.newRegime?.totalTax === 0 ? 'var(--green)' : 'var(--red)'}
              icon="🧾"
              delay={0.05}
            />
            <StatCard
              label="Recommended Choice"
              value={taxData?.recommendedRegime === 'new' ? 'New Regime' : 'Old Regime'}
              sub={taxData?.annualTaxSavings > 0 ? `Saves ${fmt(taxData.annualTaxSavings)}/yr` : 'Same Tax in Both'}
              color="var(--gold)"
              icon="⚖️"
              delay={0.1}
            />
            <StatCard
              label="EPF + Professional Tax"
              value={fmt((activeTakeHome?.monthly?.providentFund || 0) + (activeTakeHome?.monthly?.professionalTax || 0)) + '/mo'}
              sub={`EPF: ${fmt(activeTakeHome?.annual?.providentFund)}/yr`}
              color="var(--teal)"
              icon="🛡️"
              delay={0.15}
            />
          </div>

          {/* ── Recommendation Notice ── */}
          {taxData?.recommendationMsg && (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 28,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span>{taxData.recommendationMsg}</span>
            </div>
          )}

          {/* ── Main Two Column Layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'flex-start' }}>

            {/* ── LEFT COLUMN: Income & Deductions Inputs ── */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>
                  ⚙️ Income & Deductions
                </div>
                {calculating && <span style={{ fontSize: 12, color: 'var(--gold)' }}>Calculating...</span>}
              </div>

              {/* Annual Gross Salary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <label style={{ color: 'var(--text-2)', fontWeight: 600 }}>Annual CTC / Gross Income</label>
                  <strong style={{ color: 'var(--gold)', fontSize: 15 }}>{fmt(form.annualGrossSalary)}</strong>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="5000000"
                  step="25000"
                  value={form.annualGrossSalary}
                  onChange={(e) => updateField('annualGrossSalary', Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="number"
                    className="form-input"
                    value={form.annualGrossSalary}
                    onChange={(e) => updateField('annualGrossSalary', Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
                    ~{fmt(form.annualGrossSalary / 12)}/mo
                  </div>
                </div>
              </div>

              {/* Salaried Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 10,
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Are you Salaried?</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Includes ₹75,000 standard deduction</div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isSalaried}
                  onChange={(e) => updateField('isSalaried', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
              </div>

              {/* Deductions Header Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '12px 0',
                borderTop: '1px solid var(--border)',
                marginBottom: showDeductions ? 16 : 0,
              }}
              onClick={() => setShowDeductions(!showDeductions)}
              >
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Old Regime Deductions</span>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>80C, 80D, NPS, Home Loan Interest</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{showDeductions ? '▲' : '▼'}</span>
              </div>

              {showDeductions && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 80C */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>Section 80C (PPF, ELSS, EPF, LIC)</span>
                      <strong style={{ color: 'var(--text)' }}>{fmt(form.sec80C)} / 1.5L</strong>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sec80C}
                      onChange={(e) => updateField('sec80C', Number(e.target.value))}
                      placeholder="Max ₹1,50,000"
                    />
                  </div>

                  {/* 80D */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>Section 80D (Health Insurance Mediclaim)</span>
                      <strong style={{ color: 'var(--text)' }}>{fmt(form.sec80D)}</strong>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sec80D}
                      onChange={(e) => updateField('sec80D', Number(e.target.value))}
                      placeholder="Self: ₹25k, Parents: ₹50k"
                    />
                  </div>

                  {/* NPS 80CCD */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>Section 80CCD(1B) (NPS Extra ₹50,000)</span>
                      <strong style={{ color: 'var(--text)' }}>{fmt(form.sec80CCD)}</strong>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sec80CCD}
                      onChange={(e) => updateField('sec80CCD', Number(e.target.value))}
                      placeholder="Max ₹50,000"
                    />
                  </div>

                  {/* Home Loan Interest 24b */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>Section 24(b) (Home Loan Interest)</span>
                      <strong style={{ color: 'var(--text)' }}>{fmt(form.sec24b)}</strong>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sec24b}
                      onChange={(e) => updateField('sec24b', Number(e.target.value))}
                      placeholder="Max ₹2,00,000"
                    />
                  </div>

                  {/* HRA */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>HRA Exemption (Rent receipts)</span>
                      <strong style={{ color: 'var(--text)' }}>{fmt(form.hraExemption)}</strong>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={form.hraExemption}
                      onChange={(e) => updateField('hraExemption', Number(e.target.value))}
                      placeholder="HRA deduction"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT COLUMN: In-Hand Pay & Regime Comparison ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Take-Home Pay Breakdown Card */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  💰 Monthly Take-Home Pay Breakdown
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
                  Actual in-hand cash deposited into your bank account each month
                </div>

                <div style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Net Monthly In-Hand
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--green)', marginTop: 4 }}>
                      {fmt(activeTakeHome?.monthly?.netTakeHome)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Annual In-Hand</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                      {fmt(activeTakeHome?.annual?.netTakeHome)}
                    </div>
                  </div>
                </div>

                {/* Salary Deductions Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>Gross Monthly Salary</span>
                    <strong style={{ color: 'var(--text)' }}>+{fmt(activeTakeHome?.monthly?.grossSalary)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>Income Tax (TDS / Mo)</span>
                    <strong style={{ color: activeTakeHome?.monthly?.incomeTax > 0 ? 'var(--red)' : 'var(--green)' }}>
                      -{fmt(activeTakeHome?.monthly?.incomeTax)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>Provident Fund (EPF / Mo)</span>
                    <strong style={{ color: 'var(--teal)' }}>-{fmt(activeTakeHome?.monthly?.providentFund)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: 'var(--text-2)' }}>Professional Tax (PT / Mo)</span>
                    <strong style={{ color: 'var(--text-3)' }}>-{fmt(activeTakeHome?.monthly?.professionalTax)}</strong>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Regime Comparison Card */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  ⚖️ New vs Old Tax Regime Comparison
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>
                  Detailed comparison based on current Income Tax slabs
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {/* New Regime Card */}
                  <div style={{
                    padding: '14px',
                    borderRadius: 10,
                    border: `1px solid ${taxData?.recommendedRegime === 'new' ? 'var(--green)' : 'var(--border)'}`,
                    background: taxData?.recommendedRegime === 'new' ? 'rgba(49, 196, 141, 0.08)' : 'var(--bg-elevated)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14 }}>New Regime</strong>
                      {taxData?.recommendedRegime === 'new' && (
                        <span style={{ fontSize: 10, background: 'var(--green)', color: '#000', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                          WINNER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Budget 2025 (FY 2025-26)</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: taxData?.newRegime?.totalTax === 0 ? 'var(--green)' : 'var(--text)', marginBottom: 8 }}>
                      {fmt(taxData?.newRegime?.totalTax)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      • Std Deduction: ₹75,000<br />
                      • Sec 87A Rebate: {fmt(taxData?.newRegime?.rebate87A)}<br />
                      • Taxable Income: {fmt(taxData?.newRegime?.taxableIncome)}
                    </div>
                  </div>

                  {/* Old Regime Card */}
                  <div style={{
                    padding: '14px',
                    borderRadius: 10,
                    border: `1px solid ${taxData?.recommendedRegime === 'old' ? 'var(--green)' : 'var(--border)'}`,
                    background: taxData?.recommendedRegime === 'old' ? 'rgba(49, 196, 141, 0.08)' : 'var(--bg-elevated)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14 }}>Old Regime</strong>
                      {taxData?.recommendedRegime === 'old' && (
                        <span style={{ fontSize: 10, background: 'var(--green)', color: '#000', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                          WINNER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>With Deductions</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: taxData?.oldRegime?.totalTax === 0 ? 'var(--green)' : 'var(--text)', marginBottom: 8 }}>
                      {fmt(taxData?.oldRegime?.totalTax)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      • Std Deduction: ₹50,000<br />
                      • Total Deductions: {fmt(taxData?.oldRegime?.totalDeductions)}<br />
                      • Taxable Income: {fmt(taxData?.oldRegime?.taxableIncome)}
                    </div>
                  </div>
                </div>

                {/* Annual Comparison Bar Chart */}
                <div style={{ height: 160, marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                      <Tooltip formatter={(value) => [fmt(value)]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="Net Take Home" stackId="a" fill="var(--green)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Income Tax" stackId="a" fill="var(--red)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="EPF + PT" stackId="a" fill="var(--teal)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ── Tax Tips & Optimization Section ── */}
          {taxData?.tips?.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
                💡 Smart Tax-Saving Recommendations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {taxData.tips.map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 4 }}>
                      {tip.title}
                    </strong>
                    <div style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {tip.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
