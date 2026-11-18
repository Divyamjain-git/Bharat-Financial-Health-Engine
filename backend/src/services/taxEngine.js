/**
 * Indian Tax Engine — Budget 2025 (FY 2025-26 / AY 2026-27) & Old Regime
 * 
 * Compliant with official Income Tax Department & Ministry of Finance rules:
 * - New Tax Regime (Budget 2025):
 *   • Slabs: 0-4L Nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, >24L 30%
 *   • Standard Deduction: ₹75,000 for salaried employees
 *   • Section 87A Rebate: Up to ₹60,000 (Taxable income up to ₹12 Lakh has ₹0 tax)
 *   • Effective Tax-Free Gross Salary: ₹12.75 Lakh (₹12L + ₹75k Standard Deduction)
 *   • Marginal Relief: Applies for income slightly above ₹12 Lakh to prevent tax cliff
 *   • Health & Education Cess: 4%
 * 
 * - Old Tax Regime:
 *   • Slabs: 0-2.5L Nil, 2.5-5L 5%, 5-10L 20%, >10L 30%
 *   • Standard Deduction: ₹50,000 for salaried employees
 *   • Section 87A Rebate: Up to ₹12,500 (Taxable income up to ₹5 Lakh has ₹0 tax)
 *   • Deductions: 80C (max ₹1.5L), 80D (max ₹75k), 80CCD(1B) NPS (max ₹50k), Sec 24b Home Loan (max ₹2L), HRA
 *   • Health & Education Cess: 4%
 */

// ─── Calculate New Tax Regime (FY 2025-26 / Budget 2025) ──────────────────────
function calculateNewRegime({ grossIncome, isSalaried = true }) {
  const standardDeduction = isSalaried ? 75000 : 0;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  // Slabs computation
  let slabTax = 0;
  const breakdown = [];

  // Slab 1: 0 - 4 Lakh (0%)
  const s1 = Math.min(taxableIncome, 400000);
  breakdown.push({ slab: 'Up to ₹4,00,000', rate: '0%', taxableAmount: s1, tax: 0 });

  // Slab 2: 4 - 8 Lakh (5%)
  if (taxableIncome > 400000) {
    const s2 = Math.min(taxableIncome - 400000, 400000);
    const t2 = s2 * 0.05;
    slabTax += t2;
    breakdown.push({ slab: '₹4,00,001 to ₹8,00,000', rate: '5%', taxableAmount: s2, tax: Math.round(t2) });
  }

  // Slab 3: 8 - 12 Lakh (10%)
  if (taxableIncome > 800000) {
    const s3 = Math.min(taxableIncome - 800000, 400000);
    const t3 = s3 * 0.10;
    slabTax += t3;
    breakdown.push({ slab: '₹8,00,001 to ₹12,00,000', rate: '10%', taxableAmount: s3, tax: Math.round(t3) });
  }

  // Slab 4: 12 - 16 Lakh (15%)
  if (taxableIncome > 1200000) {
    const s4 = Math.min(taxableIncome - 1200000, 400000);
    const t4 = s4 * 0.15;
    slabTax += t4;
    breakdown.push({ slab: '₹12,00,001 to ₹16,00,000', rate: '15%', taxableAmount: s4, tax: Math.round(t4) });
  }

  // Slab 5: 16 - 20 Lakh (20%)
  if (taxableIncome > 1600000) {
    const s5 = Math.min(taxableIncome - 1600000, 400000);
    const t5 = s5 * 0.20;
    slabTax += t5;
    breakdown.push({ slab: '₹16,00,001 to ₹20,00,000', rate: '20%', taxableAmount: s5, tax: Math.round(t5) });
  }

  // Slab 6: 20 - 24 Lakh (25%)
  if (taxableIncome > 2000000) {
    const s6 = Math.min(taxableIncome - 2000000, 400000);
    const t6 = s6 * 0.25;
    slabTax += t6;
    breakdown.push({ slab: '₹20,00,001 to ₹24,00,000', rate: '25%', taxableAmount: s6, tax: Math.round(t6) });
  }

  // Slab 7: Above 24 Lakh (30%)
  if (taxableIncome > 2400000) {
    const s7 = taxableIncome - 2400000;
    const t7 = s7 * 0.30;
    slabTax += t7;
    breakdown.push({ slab: 'Above ₹24,00,000', rate: '30%', taxableAmount: s7, tax: Math.round(t7) });
  }

  // Section 87A Rebate & Marginal Relief
  let rebate87A = 0;
  let marginalRelief = 0;
  let taxAfterRebate = slabTax;

  if (taxableIncome <= 1200000) {
    // Full rebate up to ₹12L (max ₹60,000)
    rebate87A = Math.min(slabTax, 60000);
    taxAfterRebate = 0;
  } else {
    // Check Marginal Relief for income slightly above 12L
    // Excess income over 12 Lakh
    const excessIncome = taxableIncome - 1200000;
    // Extra tax above zero
    if (slabTax > excessIncome) {
      marginalRelief = slabTax - excessIncome;
      taxAfterRebate = excessIncome; // capped at excess income
    }
  }

  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = Math.round(taxAfterRebate + cess);

  return {
    regime: 'new',
    regimeName: 'New Tax Regime (Budget 2025)',
    grossIncome,
    standardDeduction,
    totalDeductions: standardDeduction,
    taxableIncome,
    slabTax: Math.round(slabTax),
    rebate87A: Math.round(rebate87A),
    marginalRelief: Math.round(marginalRelief),
    taxBeforeCess: Math.round(taxAfterRebate),
    cess,
    totalTax,
    monthlyTax: Math.round(totalTax / 12),
    effectiveRate: grossIncome > 0 ? Number(((totalTax / grossIncome) * 100).toFixed(2)) : 0,
    breakdown,
  };
}

// ─── Calculate Old Tax Regime ─────────────────────────────────────────────────
function calculateOldRegime({
  grossIncome,
  isSalaried = true,
  sec80C = 0,
  sec80D = 0,
  sec80CCD = 0, // NPS
  sec24b = 0,   // Home Loan Interest
  hraExemption = 0,
  otherDeductions = 0,
}) {
  const standardDeduction = isSalaried ? 50000 : 0;
  const claimed80C = Math.min(Math.max(0, sec80C), 150000);
  const claimed80D = Math.min(Math.max(0, sec80D), 75000); // self (25k) + parents (50k)
  const claimed80CCD = Math.min(Math.max(0, sec80CCD), 50000); // NPS additional
  const claimed24b = Math.min(Math.max(0, sec24b), 200000); // Home loan interest
  const claimedHRA = Math.max(0, hraExemption);
  const claimedOther = Math.max(0, otherDeductions);

  const totalDeductions =
    standardDeduction + claimed80C + claimed80D + claimed80CCD + claimed24b + claimedHRA + claimedOther;

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Slabs
  let slabTax = 0;
  const breakdown = [];

  // Slab 1: 0 - 2.5 Lakh (0%)
  const s1 = Math.min(taxableIncome, 250000);
  breakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', taxableAmount: s1, tax: 0 });

  // Slab 2: 2.5 - 5 Lakh (5%)
  if (taxableIncome > 250000) {
    const s2 = Math.min(taxableIncome - 250000, 250000);
    const t2 = s2 * 0.05;
    slabTax += t2;
    breakdown.push({ slab: '₹2,50,001 to ₹5,00,000', rate: '5%', taxableAmount: s2, tax: Math.round(t2) });
  }

  // Slab 3: 5 - 10 Lakh (20%)
  if (taxableIncome > 500000) {
    const s3 = Math.min(taxableIncome - 500000, 500000);
    const t3 = s3 * 0.20;
    slabTax += t3;
    breakdown.push({ slab: '₹5,00,001 to ₹10,00,000', rate: '20%', taxableAmount: s3, tax: Math.round(t3) });
  }

  // Slab 4: Above 10 Lakh (30%)
  if (taxableIncome > 1000000) {
    const s4 = taxableIncome - 1000000;
    const t4 = s4 * 0.30;
    slabTax += t4;
    breakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', taxableAmount: s4, tax: Math.round(t4) });
  }

  // Section 87A Rebate for Old Regime (up to 5L taxable income, max 12,500)
  let rebate87A = 0;
  let taxAfterRebate = slabTax;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(slabTax, 12500);
    taxAfterRebate = 0;
  }

  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = Math.round(taxAfterRebate + cess);

  return {
    regime: 'old',
    regimeName: 'Old Tax Regime (With Exemptions)',
    grossIncome,
    standardDeduction,
    deductionsBreakdown: {
      standardDeduction,
      sec80C: claimed80C,
      sec80D: claimed80D,
      sec80CCD: claimed80CCD,
      sec24b: claimed24b,
      hraExemption: claimedHRA,
      otherDeductions: claimedOther,
    },
    totalDeductions,
    taxableIncome,
    slabTax: Math.round(slabTax),
    rebate87A: Math.round(rebate87A),
    taxBeforeCess: Math.round(taxAfterRebate),
    cess,
    totalTax,
    monthlyTax: Math.round(totalTax / 12),
    effectiveRate: grossIncome > 0 ? Number(((totalTax / grossIncome) * 100).toFixed(2)) : 0,
    breakdown,
  };
}

// ─── In-Hand / Take-Home Pay Engine ──────────────────────────────────────────
function calculateTakeHomePay({
  annualGrossSalary,
  chosenTaxAmount,
  customEPFAnnual = null,
  customPTAnnual = 2400, // standard ₹200/mo in Indian states
}) {
  const gross = Math.max(0, annualGrossSalary);
  
  // EPF: Standard employee contribution is 12% of basic.
  // In typical Indian CTC, basic is roughly 40-50% of CTC.
  // So employee EPF is ~5-6% of gross salary, capped or as specified.
  const epf = customEPFAnnual != null
    ? Math.max(0, customEPFAnnual)
    : Math.round(gross * 0.05); // standard ~5% of gross

  const pt = Math.min(2500, Math.max(0, customPTAnnual));
  const tax = Math.max(0, chosenTaxAmount);

  const totalDeductionsAnnual = epf + pt + tax;
  const netTakeHomeAnnual = Math.max(0, gross - totalDeductionsAnnual);
  const netTakeHomeMonthly = Math.round(netTakeHomeAnnual / 12);

  return {
    annual: {
      grossSalary: gross,
      incomeTax: tax,
      providentFund: epf,
      professionalTax: pt,
      totalDeductions: totalDeductionsAnnual,
      netTakeHome: netTakeHomeAnnual,
    },
    monthly: {
      grossSalary: Math.round(gross / 12),
      incomeTax: Math.round(tax / 12),
      providentFund: Math.round(epf / 12),
      professionalTax: Math.round(pt / 12),
      totalDeductions: Math.round(totalDeductionsAnnual / 12),
      netTakeHome: netTakeHomeMonthly,
    },
    percentageOfGross: {
      takeHome: gross > 0 ? Number(((netTakeHomeAnnual / gross) * 100).toFixed(1)) : 0,
      tax: gross > 0 ? Number(((tax / gross) * 100).toFixed(1)) : 0,
      pf: gross > 0 ? Number(((epf / gross) * 100).toFixed(1)) : 0,
      pt: gross > 0 ? Number(((pt / gross) * 100).toFixed(1)) : 0,
    },
  };
}

// ─── Main Comparison & Optimization Function ─────────────────────────────────
function computeTaxComparison(params) {
  const grossIncome = Number(params.annualGrossSalary || (Number(params.monthlyIncome || 0) * 12));
  const isSalaried = params.isSalaried !== false;

  const newRegime = calculateNewRegime({ grossIncome, isSalaried });
  const oldRegime = calculateOldRegime({
    grossIncome,
    isSalaried,
    sec80C: Number(params.sec80C || 0),
    sec80D: Number(params.sec80D || 0),
    sec80CCD: Number(params.sec80CCD || 0),
    sec24b: Number(params.sec24b || 0),
    hraExemption: Number(params.hraExemption || 0),
    otherDeductions: Number(params.otherDeductions || 0),
  });

  const taxDifference = Math.abs(newRegime.totalTax - oldRegime.totalTax);
  const recommendedRegime = newRegime.totalTax <= oldRegime.totalTax ? 'new' : 'old';
  const bestTaxAmount = Math.min(newRegime.totalTax, oldRegime.totalTax);

  const takeHomeNew = calculateTakeHomePay({
    annualGrossSalary: grossIncome,
    chosenTaxAmount: newRegime.totalTax,
    customEPFAnnual: params.customEPFAnnual,
  });

  const takeHomeOld = calculateTakeHomePay({
    annualGrossSalary: grossIncome,
    chosenTaxAmount: oldRegime.totalTax,
    customEPFAnnual: params.customEPFAnnual,
  });

  let recommendationMsg = '';
  if (newRegime.totalTax === 0 && oldRegime.totalTax === 0) {
    recommendationMsg = '🎉 You pay ZERO tax under both regimes! New Regime is recommended as it requires zero paperwork.';
  } else if (newRegime.totalTax < oldRegime.totalTax) {
    recommendationMsg = `✅ New Tax Regime is better for you! You save ₹${taxDifference.toLocaleString('en-IN')} annually with no paperwork.`;
  } else if (oldRegime.totalTax < newRegime.totalTax) {
    recommendationMsg = `💡 Old Tax Regime is better for you! Your deductions (80C/80D/Home Loan) save you ₹${taxDifference.toLocaleString('en-IN')} in tax.`;
  } else {
    recommendationMsg = '⚖️ Both regimes yield the exact same tax. Choose New Regime for zero documentation hassle.';
  }

  // Tax Saving Opportunities (Deduction Headroom for Old Regime)
  const room80C = Math.max(0, 150000 - Number(params.sec80C || 0));
  const room80D = Math.max(0, 75000 - Number(params.sec80D || 0));
  const room80CCD = Math.max(0, 50000 - Number(params.sec80CCD || 0));

  const tips = [];
  if (grossIncome <= 1275000 && isSalaried) {
    tips.push({
      title: 'Zero Tax Advantage (Budget 2025)',
      desc: 'Under the New Tax Regime, gross income up to ₹12.75 Lakh has ₹0 tax liability due to ₹75k standard deduction and ₹60k Section 87A rebate.',
    });
  }
  if (room80C > 0) {
    tips.push({
      title: `Invest ₹${room80C.toLocaleString('en-IN')} more in Section 80C`,
      desc: 'You can invest in ELSS mutual funds, PPF, or EPF to lower your taxable income under the Old Regime.',
    });
  }
  if (room80D > 0) {
    tips.push({
      title: 'Health Insurance (Section 80D)',
      desc: 'Paying health insurance premium for yourself (up to ₹25,000) and parents (up to ₹50,000) saves direct tax under Old Regime.',
    });
  }
  if (room80CCD > 0) {
    tips.push({
      title: 'National Pension System (NPS 80CCD 1B)',
      desc: 'Exclusive additional ₹50,000 deduction available specifically for NPS investments over and above 80C.',
    });
  }

  return {
    grossIncome,
    isSalaried,
    recommendedRegime,
    annualTaxSavings: taxDifference,
    monthlyTaxSavings: Math.round(taxDifference / 12),
    recommendationMsg,
    newRegime,
    oldRegime,
    takeHome: {
      recommended: recommendedRegime === 'new' ? takeHomeNew : takeHomeOld,
      newRegime: takeHomeNew,
      oldRegime: takeHomeOld,
    },
    tips,
  };
}

module.exports = {
  calculateNewRegime,
  calculateOldRegime,
  calculateTakeHomePay,
  computeTaxComparison,
};
