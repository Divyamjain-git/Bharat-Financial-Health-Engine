/**
 * Inflation Controller
 * Powers three features:
 *  1. GET /inflation/rate          — live CPI rate + trend
 *  2. POST /inflation/goal-planner — inflation-adjusted goal analysis
 *  3. POST /inflation/emergency-fund — purchasing power erosion of emergency fund
 *  4. POST /inflation/simulate     — inflation "what-if" scenario on financial score
 */

const Score = require('../models/Score');
const {
  getLiveInflationRate,
  inflationAdjustedAmount,
  purchasingPowerDecay,
  realReturn,
  inflationAdjustedGoalSIP,
} = require('../services/inflationService');

// ── 1. Live CPI Rate ────────────────────────────────────────────────────────────
exports.getRate = async (req, res, next) => {
  try {
    const data = await getLiveInflationRate();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

// ── 2. Inflation-Adjusted Goal Planner ─────────────────────────────────────────
/**
 * Body: { goalName, nominalTarget, yearsToGoal, expectedReturn?, customInflationRate? }
 */
exports.goalPlanner = async (req, res, next) => {
  try {
    const { goalName, nominalTarget, yearsToGoal, expectedReturn = 7, customInflationRate } = req.body;

    const inflData = await getLiveInflationRate();
    const inflRate = customInflationRate != null ? parseFloat(customInflationRate) : inflData.rate;

    if (!nominalTarget || !yearsToGoal) {
      return res.status(400).json({ success: false, message: 'nominalTarget and yearsToGoal are required.' });
    }

    const target = parseFloat(nominalTarget);
    const years = parseFloat(yearsToGoal);

    // Inflation-adjusted future cost
    const inflationAdjustedTarget = inflationAdjustedAmount(target, inflRate, years);
    const inflationPremium = inflationAdjustedTarget - target;

    // Monthly SIP needed (nominal vs inflation-adjusted)
    const nominalSIP = inflationAdjustedGoalSIP(target, 0, years, expectedReturn);
    const realSIP = inflationAdjustedGoalSIP(target, inflRate, years, expectedReturn);
    const extraSIPNeeded = realSIP - nominalSIP;

    // Real return on investment
    const rr = realReturn(expectedReturn, inflRate);

    // Year-by-year projection — both nominal and real
    const projection = [];
    for (let y = 1; y <= years; y++) {
      projection.push({
        year: y,
        nominalCost: Math.round(inflationAdjustedAmount(target, inflRate, y)),
        sipAccumulated: Math.round(
          realSIP * ((Math.pow(1 + expectedReturn / 100 / 12, y * 12) - 1) / (expectedReturn / 100 / 12))
        ),
      });
    }

    res.json({
      success: true,
      data: {
        goalName: goalName || 'Your Goal',
        nominalTarget: Math.round(target),
        inflationAdjustedTarget: Math.round(inflationAdjustedTarget),
        inflationPremium: Math.round(inflationPremium),
        inflationRate: inflRate,
        inflationSource: inflData.source,
        inflationMonth: inflData.month,
        years,
        expectedReturn,
        realReturnRate: Math.round(rr * 100) / 100,
        nominalSIP,
        realSIP,
        extraSIPNeeded: Math.round(extraSIPNeeded),
        projection,
        insight: rr < 1
          ? '⚠️ Inflation is nearly eroding your investment returns. Consider equity mutual funds or ELSS for higher real returns.'
          : rr < 3
          ? '📊 Your real return is positive but modest. Diversify into equity for better inflation-beating growth.'
          : '✅ Your expected returns are comfortably outpacing inflation.',
      },
    });
  } catch (e) { next(e); }
};

// ── 3. Emergency Fund Purchasing Power Erosion ─────────────────────────────────
/**
 * Body: { emergencyFundAmount, savingsAccountRate?, customInflationRate?, projectionYears? }
 */
exports.emergencyFundErosion = async (req, res, next) => {
  try {
    const {
      emergencyFundAmount,
      savingsAccountRate = 3.5,   // typical Indian savings account rate
      customInflationRate,
      projectionYears = 5,
    } = req.body;

    if (!emergencyFundAmount) {
      return res.status(400).json({ success: false, message: 'emergencyFundAmount is required.' });
    }

    const inflData = await getLiveInflationRate();
    const inflRate = customInflationRate != null ? parseFloat(customInflationRate) : inflData.rate;
    const amount = parseFloat(emergencyFundAmount);
    const savRate = parseFloat(savingsAccountRate);
    const years = parseInt(projectionYears) || 5;

    const rr = realReturn(savRate, inflRate);
    const isEroding = rr < 0;

    // Year-by-year purchasing power
    const yearlyErosion = [];
    for (let y = 1; y <= years; y++) {
      const nominalValue = amount * Math.pow(1 + savRate / 100, y); // with savings interest
      const realValue = purchasingPowerDecay(nominalValue, inflRate, y);
      const purchasingPowerLoss = amount - realValue;
      yearlyErosion.push({
        year: y,
        nominalValue: Math.round(nominalValue),
        realValue: Math.round(realValue),
        purchasingPowerLoss: Math.round(purchasingPowerLoss),
      });
    }

    const finalYear = yearlyErosion[yearlyErosion.length - 1];
    const totalLoss = Math.round(amount - finalYear.realValue);
    const lossPercent = Math.round((totalLoss / amount) * 100);

    // Suggest a better instrument
    const suggestions = [];
    if (isEroding) {
      suggestions.push({ instrument: 'Liquid Mutual Fund', typicalRate: 6.5, platforms: ['Paytm Money', 'Groww', 'Zerodha Coin'] });
      suggestions.push({ instrument: 'High-yield Savings (IDFC/AU Small Finance)', typicalRate: 7.0, platforms: ['IDFC FIRST Bank', 'AU Bank'] });
    } else if (rr < 1) {
      suggestions.push({ instrument: 'Overnight/Liquid Fund', typicalRate: 6.8, platforms: ['Groww', 'Kuvera'] });
    }

    // Best alternative: liquid fund at 7%
    const liquidFundRate = 7.0;
    const rrLiquid = realReturn(liquidFundRate, inflRate);
    const altFinalValue = Math.round(purchasingPowerDecay(amount * Math.pow(1 + liquidFundRate / 100, years), inflRate, years));

    res.json({
      success: true,
      data: {
        emergencyFundAmount: amount,
        savingsAccountRate: savRate,
        inflationRate: inflRate,
        inflationSource: inflData.source,
        inflationMonth: inflData.month,
        realReturnRate: Math.round(rr * 100) / 100,
        isEroding,
        projectionYears: years,
        yearlyErosion,
        summary: {
          currentValue: amount,
          valueAfterYears: finalYear.realValue,
          purchasingPowerLoss: totalLoss,
          lossPercent,
        },
        alternativeLiquidFund: {
          rate: liquidFundRate,
          realReturn: Math.round(rrLiquid * 100) / 100,
          valueAfterYears: altFinalValue,
          extraPreserved: altFinalValue - finalYear.realValue,
        },
        suggestions,
        alert: isEroding
          ? `🚨 Your emergency fund is losing ₹${totalLoss.toLocaleString('en-IN')} in real value over ${years} years. Inflation (${inflRate}%) exceeds your savings rate (${savRate}%).`
          : `📉 Your fund retains most of its value but earns only ${rr.toFixed(1)}% real return. A liquid fund could do better.`,
      },
    });
  } catch (e) { next(e); }
};

// ── 4. Inflation What-If Simulation ────────────────────────────────────────────
/**
 * Body: { inflationScenario: 'low'|'moderate'|'high'|'custom', customRate?, years? }
 * Simulates how inflation changes effective income, savings, and score.
 */
exports.inflationSimulate = async (req, res, next) => {
  try {
    const { inflationScenario = 'moderate', customRate, years = 3 } = req.body;

    const score = await Score.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!score) return res.status(400).json({ success: false, message: 'Complete your profile first.' });

    const inflData = await getLiveInflationRate();

    const SCENARIOS = {
      low:      { rate: 2.5,  label: 'Low Inflation',      desc: 'RBI lower-band scenario (2.5%)' },
      moderate: { rate: inflData.rate, label: 'Current CPI', desc: `Live CPI rate (${inflData.rate}%)` },
      high:     { rate: 7.5,  label: 'High Inflation',     desc: 'Stress scenario (7.5%)' },
      custom:   { rate: parseFloat(customRate) || inflData.rate, label: 'Custom Rate', desc: `User-defined (${customRate}%)` },
    };

    const scenario = SCENARIOS[inflationScenario] || SCENARIOS.moderate;
    const rate = scenario.rate / 100;
    const yrs = parseInt(years) || 3;

    const { monthlyIncome, totalMonthlyExpenses, totalMonthlyEMI, savingsRate } = score.metrics;

    // Project income assuming no raise (real income falls), expenses rise with inflation
    const projections = [];
    for (let y = 1; y <= yrs; y++) {
      const realIncome = monthlyIncome / Math.pow(1 + rate, y);           // purchasing power of same salary
      const inflatedExpenses = totalMonthlyExpenses * Math.pow(1 + rate, y); // expenses grow
      const inflatedEMI = totalMonthlyEMI;                                 // EMIs are fixed nominal

      const realSavings = realIncome - inflatedExpenses - inflatedEMI;
      const realSavingsRate = realIncome > 0 ? (realSavings / realIncome) * 100 : 0;
      const incomeSqueeze = monthlyIncome - realIncome;
      const expenseGrowth = inflatedExpenses - totalMonthlyExpenses;

      // Approximate score impact (savings rate is the most inflation-sensitive component)
      const savingsScoreDelta = Math.round((realSavingsRate - savingsRate) * 1.5); // rough sensitivity
      const simulatedScore = Math.min(100, Math.max(0, score.totalScore + savingsScoreDelta));

      projections.push({
        year: y,
        realIncome: Math.round(realIncome),
        inflatedExpenses: Math.round(inflatedExpenses),
        realSavings: Math.round(realSavings),
        realSavingsRate: Math.round(realSavingsRate * 10) / 10,
        incomeSqueeze: Math.round(incomeSqueeze),
        expenseGrowth: Math.round(expenseGrowth),
        simulatedScore,
        scoreDelta: simulatedScore - score.totalScore,
      });
    }

    const finalYear = projections[projections.length - 1];

    const actions = [];
    if (finalYear.scoreDelta < -5) {
      actions.push('Request an annual salary revision matching or beating CPI inflation.');
      actions.push('Lock in long-term fixed-rate loans now before rates potentially rise.');
    }
    if (finalYear.realSavingsRate < 10) {
      actions.push('Switch to a liquid/overnight fund for emergency savings to earn ~7% vs 3.5% in savings accounts.');
      actions.push('Consider inflation-indexed investments like RBI Floating Rate Savings Bonds or Sovereign Gold Bonds.');
    }
    actions.push('Review and trim discretionary expenses annually as prices rise.');

    res.json({
      success: true,
      data: {
        scenario: {
          ...scenario,
          currentCPI: inflData.rate,
          inflationSource: inflData.source,
          inflationMonth: inflData.month,
        },
        baseMetrics: {
          monthlyIncome,
          totalMonthlyExpenses,
          totalMonthlyEMI,
          savingsRate,
          currentScore: score.totalScore,
        },
        projections,
        summary: {
          yearsSimulated: yrs,
          incomeSqueeze: finalYear.incomeSqueeze,
          expenseGrowth: finalYear.expenseGrowth,
          savingsRateChange: Math.round((finalYear.realSavingsRate - savingsRate) * 10) / 10,
          scoreDelta: finalYear.scoreDelta,
          finalScore: finalYear.simulatedScore,
        },
        recommendedActions: actions,
      },
    });
  } catch (e) { next(e); }
};
