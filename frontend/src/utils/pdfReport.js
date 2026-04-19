/**
 * Financial Health PDF Report Generator
 * Uses jsPDF + jspdf-autotable to create a professional A4 report.
 *
 * Bug fixes:
 *  - score.metrics doesn't exist on Prisma score objects; fields are top-level
 *  - score.components doesn't exist; component scores (dtiScore etc.) are top-level
 *  - profile.expenses doesn't exist; expense fields (houseRent etc.) are top-level
 */

export const generatePDFReport = async (data) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const { user, score, profile, loans, goals, netWorth } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Colors ───────────────────────────────────────────────────────────────────
  const GOLD       = [240, 180, 41];
  const DARK       = [5, 8, 20];
  const GRAY       = [100, 120, 150];
  const LIGHT_GRAY = [240, 242, 248];

  const inr = (v) => {
    if (!v && v !== 0) return '—';
    const n = Math.abs(Math.round(v));
    const s = n.toString();
    const last = s.slice(-3);
    const rest = s.slice(0, -3);
    const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last : last;
    return (v < 0 ? '-₹' : '₹') + formatted;
  };

  const gradeColor = (g) => {
    const m = { Excellent:[49,196,141], Good:[79,142,247], Fair:[240,180,41], Poor:[249,115,22], Critical:[240,82,82] };
    return m[g] || GRAY;
  };

  // ── Bug fix: read all score fields directly (top-level Prisma fields) ─────────
  const metrics = {
    monthlyIncome:        score?.monthlyIncome        ?? 0,
    totalMonthlyEMI:      score?.totalMonthlyEMI      ?? 0,
    totalMonthlyExpenses: score?.totalMonthlyExpenses ?? 0,
    savingsRate:          score?.savingsRate          ?? 0,
    dtiRatio:             score?.dtiRatio             ?? 0,
    creditUtilization:    score?.creditUtilization    ?? 0,
    emergencyFundMonths:  score?.emergencyFundMonths  ?? 0,
  };

  const components = {
    dtiScore:      score?.dtiScore      ?? 0,
    savingsScore:  score?.savingsScore  ?? 0,
    emergencyScore:score?.emergencyScore?? 0,
    creditScore:   score?.creditScore   ?? 0,
    expenseScore:  score?.expenseScore  ?? 0,
  };

  // ── Bug fix: profile expense fields are top-level ─────────────────────────────
  const exp = profile || {};

  // ── Page 1: Header ───────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 45, 'F');

  // Logo box
  doc.setFillColor(...GOLD);
  doc.roundedRect(14, 8, 28, 28, 4, 4, 'F');
  doc.setTextColor(5, 8, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BFHE', 28, 25, { align: 'center' });

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Financial Health Report', 50, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 190, 210);
  doc.text(
    `Generated for ${user?.name || 'User'} · ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`,
    50, 30
  );
  doc.text(`Role: ${user?.role === 'salaried' ? 'Salaried Professional' : 'Business Owner / MSME'}`, 50, 38);

  let y = 58;

  // ── Score Banner ──────────────────────────────────────────────────────────────
  const gc = gradeColor(score?.grade);
  doc.setFillColor(...gc);
  doc.setGlobalAlpha(0.1);
  doc.rect(14, y - 4, W - 28, 32, 'F');
  doc.setGlobalAlpha(1);
  doc.setDrawColor(...gc);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y - 4, W - 28, 32, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...gc);
  doc.text(String(score?.totalScore ?? '--'), 30, y + 18);

  doc.setFontSize(12);
  doc.text(score?.grade ?? '—', 58, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text('Financial Health Score (0–100)', 58, y + 18);
  doc.text(
    `DTI: ${metrics.dtiRatio.toFixed(1)}%  |  Savings: ${metrics.savingsRate.toFixed(1)}%  |  Emergency Fund: ${metrics.emergencyFundMonths.toFixed(1)} months`,
    58, y + 26
  );

  y += 42;

  // ── Key Metrics Table ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Key Financial Metrics', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Your Value', 'Benchmark', 'Status']],
    body: [
      ['Monthly Income',         inr(metrics.monthlyIncome),        '—',           '—'],
      ['Total Monthly EMI',      inr(metrics.totalMonthlyEMI),      '< 30% income', metrics.dtiRatio < 30 ? '✅ Good' : metrics.dtiRatio < 50 ? '⚠️ Fair' : '🔴 High'],
      ['Debt-to-Income Ratio',   `${metrics.dtiRatio.toFixed(1)}%`, '< 35%',       metrics.dtiRatio < 35 ? '✅ Good' : '⚠️ Review'],
      ['Monthly Savings Rate',   `${metrics.savingsRate.toFixed(1)}%`, '> 20%',   metrics.savingsRate >= 20 ? '✅ Good' : '⚠️ Low'],
      ['Emergency Fund',         `${metrics.emergencyFundMonths.toFixed(1)} months`, '6 months', metrics.emergencyFundMonths >= 6 ? '✅ Funded' : '⚠️ Build more'],
      ['Credit Utilization',     `${metrics.creditUtilization.toFixed(1)}%`, '< 30%', metrics.creditUtilization < 30 ? '✅ Good' : '⚠️ Reduce'],
      ['Total Monthly Expenses', inr(metrics.totalMonthlyExpenses), '< 50% income', '—'],
    ],
    headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Score Component Breakdown ─────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Score Component Breakdown', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Component', 'Weight', 'Score (0–100)', 'Weighted Score']],
    body: [
      ['Debt-to-Income Ratio', '25%', `${components.dtiScore}/100`,       `${(components.dtiScore * 0.25).toFixed(1)}`],
      ['Savings Rate',         '20%', `${components.savingsScore}/100`,   `${(components.savingsScore * 0.20).toFixed(1)}`],
      ['Emergency Fund',       '20%', `${components.emergencyScore}/100`, `${(components.emergencyScore * 0.20).toFixed(1)}`],
      ['Credit Utilization',   '20%', `${components.creditScore}/100`,    `${(components.creditScore * 0.20).toFixed(1)}`],
      ['Expense Ratio',        '15%', `${components.expenseScore}/100`,   `${(components.expenseScore * 0.15).toFixed(1)}`],
      ['TOTAL',               '100%', '—',                                 `${score?.totalScore ?? 0}`],
    ],
    headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Expense Breakdown ─────────────────────────────────────────────────────────
  const expenseRows = [
    ['House Rent',      exp.houseRent      || 0],
    ['Groceries',       exp.groceries      || 0],
    ['Electricity',     exp.electricityBill|| 0],
    ['Gas',             exp.gasBill        || 0],
    ['Water',           exp.waterBill      || 0],
    ['Internet/Mobile', exp.internetMobile || 0],
    ['Medical',         exp.medicalExpenses|| 0],
    ['Vehicle Fuel',    exp.vehicleFuel    || 0],
    ['School Fees',     exp.schoolFees     || 0],
    ['Other',           exp.otherExpenses  || 0],
  ].filter(([, v]) => v > 0);

  if (expenseRows.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Monthly Expense Breakdown', 14, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [['Expense Category', 'Monthly Amount']],
      body: expenseRows.map(([label, val]) => [label, inr(val)]),
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Active Loans ──────────────────────────────────────────────────────────────
  if (loans && loans.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Active Loans', 14, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [['Loan Type', 'Lender', 'Outstanding', 'Monthly EMI', 'Interest Rate']],
      body: loans.map(l => [l.loanType, l.lenderName || '—', inr(l.outstandingBalance), inr(l.monthlyEMI), `${l.interestRate}%`]),
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Financial Goals ───────────────────────────────────────────────────────────
  const activeGoals = (goals || []).filter(g => g.status === 'active');
  if (activeGoals.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Financial Goals', 14, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [['Goal', 'Target', 'Saved', 'Progress', 'Deadline']],
      body: activeGoals.map(g => {
        const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
        return [g.title, inr(g.targetAmount), inr(g.currentAmount), `${pct}%`, g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN') : '—'];
      }),
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Net Worth Summary ─────────────────────────────────────────────────────────
  if (netWorth) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Net Worth Summary', 14, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [['Item', 'Value']],
      body: [
        ['Total Assets',       inr(netWorth.totalAssets)],
        ['Total Liabilities',  inr(netWorth.totalLiabilities)],
        ['Net Worth',          inr(netWorth.netWorth)],
        ['Status',             netWorth.netWorthGrade || '—'],
      ],
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
  }

  // ── Footer on every page ──────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...DARK);
    doc.rect(0, H - 12, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 150);
    doc.text('BFHE — Bharat Financial Health Engine | Confidential', 14, H - 4);
    doc.text(`Page ${i} of ${totalPages}`, W - 14, H - 4, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  const filename = `BFHE_Report_${(user?.name || 'User').replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
