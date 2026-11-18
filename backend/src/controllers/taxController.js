const prisma = require('../config/database');
const { computeTaxComparison } = require('../services/taxEngine');

/**
 * GET /api/v1/tax/summary
 * Automatically pre-fills tax comparison using user's real saved profile & loans
 */
exports.getTaxSummary = async (req, res, next) => {
  try {
    const profile = await prisma.financialProfile.findUnique({
      where: { userId: req.user.id },
    });

    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id, isActive: true },
    });

    // Estimate Home Loan interest paid annually (Section 24b)
    const homeLoans = loans.filter(l => (l.loanType || '').toLowerCase().includes('home'));
    let estimatedAnnualHomeLoanInterest = 0;
    homeLoans.forEach(l => {
      // Rough annual interest = outstanding * interestRate%
      const annualInt = (l.outstandingBalance * (l.interestRate || 8.5)) / 100;
      estimatedAnnualHomeLoanInterest += annualInt;
    });

    const monthlySalary = profile?.netMonthlySalary || 0;
    const bonus = profile?.annualBonus || 0;
    const otherMonthly = profile?.otherMonthlyIncome || 0;
    const annualRent = (profile?.houseRent || 0) * 12;

    const annualGross = (monthlySalary * 12) + bonus + (otherMonthly * 12);

    // Initial default comparison based on profile
    const result = computeTaxComparison({
      annualGrossSalary: annualGross || 1200000,
      monthlyIncome: monthlySalary,
      isSalaried: true,
      sec80C: Math.min(150000, Math.round(annualGross * 0.05)), // estimated EPF contribution
      sec80D: profile?.medicalExpenses ? Math.min(25000, profile.medicalExpenses * 12) : 15000,
      sec24b: Math.min(200000, Math.round(estimatedAnnualHomeLoanInterest)),
      hraExemption: Math.round(annualRent * 0.4), // approximate HRA exemption
    });

    res.json({
      success: true,
      data: {
        profileData: {
          monthlySalary,
          annualBonus: bonus,
          otherMonthlyIncome: otherMonthly,
          annualGross,
          annualRent,
          estimatedHomeLoanInterest: Math.round(estimatedAnnualHomeLoanInterest),
        },
        ...result,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/v1/tax/calculate
 * Interactive calculation with custom user inputs
 */
exports.calculateTax = async (req, res, next) => {
  try {
    const {
      annualGrossSalary,
      monthlyIncome,
      isSalaried,
      sec80C,
      sec80D,
      sec80CCD,
      sec24b,
      hraExemption,
      otherDeductions,
      customEPFAnnual,
      customPTAnnual,
    } = req.body;

    const result = computeTaxComparison({
      annualGrossSalary: parseFloat(annualGrossSalary) || 0,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      isSalaried: isSalaried !== false,
      sec80C: parseFloat(sec80C) || 0,
      sec80D: parseFloat(sec80D) || 0,
      sec80CCD: parseFloat(sec80CCD) || 0,
      sec24b: parseFloat(sec24b) || 0,
      hraExemption: parseFloat(hraExemption) || 0,
      otherDeductions: parseFloat(otherDeductions) || 0,
      customEPFAnnual: customEPFAnnual != null ? parseFloat(customEPFAnnual) : null,
      customPTAnnual: customPTAnnual != null ? parseFloat(customPTAnnual) : 2400,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};
