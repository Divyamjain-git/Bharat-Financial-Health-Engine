/**
 * Financial Health PDF Report Generator
 * Uses jsPDF to create a professional PDF report
 */

export const generatePDFReport = async (data) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const { user, score, profile, loans, goals, netWorth } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Colors ──────────────────────────────────────────────────────────────────
  const GOLD = [240, 180, 41];
  const DARK = [5, 8, 20];
  const GRAY = [100, 120, 150];
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

  // ── Page 1: Header ───────────────────────────────────────────────────────────
  // Background header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 45, 'F');

  // Logo accent
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
  doc.text(`Generated for ${user?.name} · ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 50, 30);
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
  doc.text(`DTI: ${score?.metrics?.dtiRatio?.toFixed(1) ?? 0}%  |  Savings: ${score?.metrics?.savingsRate?.toFixed(1) ?? 0}%  |  Emergency Fund: ${score?.metrics?.emergencyFundMonths?.toFixed(1) ?? 0} months`, 58, y + 26);

  y += 42;

  // ── Key Metrics Table ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Key Financial Metrics', 14, y);
  y += 5;

  const metrics = score?.metrics ?? {};
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Your Value', 'Benchmark', 'Status']],
    body: [
      ['Monthly Income', inr(metrics.monthlyIncome), '—', '—'],
      ['Total Monthly EMI', inr(metrics.totalMonthlyEMI), '< 30% of income', metrics.dtiRatio < 30 ? '✅ Good' : metrics.dtiRatio < 50 ? '⚠️ Fair' : '🔴 High'],
      ['Debt-to-Income Ratio', `${metrics.dtiRatio?.toFixed(1) ?? 0}%`, '< 35%', metrics.dtiRatio < 35 ? '✅ Good' : '⚠️ Review'],
      ['Monthly Savings Rate', `${metrics.savingsRate?.toFixed(1) ?? 0}%`, '> 20%', metrics.savingsRate >= 20 ? '✅ Good' : '⚠️ Low'],
      ['Emergency Fund', `${metrics.emergencyFundMonths?.toFixed(1) ?? 0} months`, '6 months', metrics.emergencyFundMonths >= 6 ? '✅ Funded' : '⚠️ Build more'],
      ['Credit Utilization', `${metrics.creditUtilization?.toFixed(1) ?? 0}%`, '< 30%', metrics.creditUtilization < 30 ? '✅ Good' : '⚠️ Reduce'],
      ['Total Monthly Expenses', inr(metrics.totalMonthlyExpenses), '< 50% of income', '—'],
    ],
    headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Score Breakdown ──────────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Score Component Breakdown', 14, y);
  y += 5;

  const components = score?.components ?? {};
  autoTable(doc, {
    startY: y,
    head: [['Component', 'Weight', 'Score (0–100)', 'Weighted Score']],
    body: [
      ['Debt-to-Income Ratio', '25%', `${components.dtiScore ?? 0}/100`, `${((components.dtiScore ?? 0) * 0.25).toFixed(1)}`],
      ['Savings Rate', '20%', `${components.savingsScore ?? 0}/100`, `${((components.savingsScore ?? 0) * 0.20).toFixed(1)}`],
      ['Emergency Fund', '20%', `${components.emergencyScore ?? 0}/100`, `${((components.emergencyScore ?? 0) * 0.20).toFixed(1)}`],
      ['Credit Utilization', '20%', `${components.creditScore ?? 0}/100`, `${((components.creditScore ?? 0) * 0.20).toFixed(1)}`],
      ['Expense Ratio', '15%', `${components.expenseScore ?? 0}/100`, `${((components.expenseScore ?? 0) * 0.15).toFixed(1)}`],
      ['TOTAL', '100%', '—', `${score?.totalScore ?? 0}`],
    ],
    headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Loans ────────────────────────────────────────────────────────────────────
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
      body: loans.map(l => [l.loanType, l.lenderName||'—', inr(l.outstandingBalance), inr(l.monthlyEMI), `${l.interestRate}%`]),
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Goals ─────────────────────────────────────────────────────────────────────
  if (goals && goals.filter(g=>g.status==='active').length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Financial Goals', 14, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [['Goal', 'Target', 'Saved', 'Progress', 'Deadline']],
      body: goals.filter(g=>g.status==='active').map(g => {
        const pct = Math.min(100, Math.round((g.currentAmount/g.targetAmount)*100));
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
        ['Total Assets', inr(netWorth.totalAssets)],
        ['Total Liabilities', inr(netWorth.totalLiabilities)],
        ['Net Worth', inr(netWorth.netWorth)],
        ['Status', netWorth.netWorthGrade || '—'],
      ],
      headStyles: { fillColor: DARK, textColor: [255,255,255], fontStyle:'bold', fontSize:9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });
  }

  // ── Footer on all pages ───────────────────────────────────────────────────────
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

  // Save
  const filename = `BFHE_Report_${user?.name?.replace(/\s/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
