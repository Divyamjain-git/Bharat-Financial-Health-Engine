/**
 * Inflation Service
 * Fetches live India CPI data from data.gov.in (MoSPI / official GoI source)
 * Falls back to last known value → historical average if API is unavailable.
 *
 * Fix: API key moved to environment variable DATAGOV_API_KEY.
 * Add DATAGOV_API_KEY=<your_key> to backend/.env
 */

const https = require('https');

let cache = {
  rate: null,
  month: null,
  fetchedAt: null,
  historical: [],
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const RBI_TARGET_RATE = 4.0;

const HISTORICAL_FALLBACK = [
  { month: '2024-01', rate: 5.10 }, { month: '2024-02', rate: 5.09 },
  { month: '2024-03', rate: 4.85 }, { month: '2024-04', rate: 4.83 },
  { month: '2024-05', rate: 4.75 }, { month: '2024-06', rate: 5.08 },
  { month: '2024-07', rate: 3.54 }, { month: '2024-08', rate: 3.65 },
  { month: '2024-09', rate: 5.49 }, { month: '2024-10', rate: 6.21 },
  { month: '2024-11', rate: 5.48 }, { month: '2024-12', rate: 5.22 },
  { month: '2025-01', rate: 4.26 }, { month: '2025-02', rate: 3.61 },
  { month: '2025-03', rate: 3.34 }, { month: '2025-04', rate: 3.16 },
  { month: '2025-05', rate: 2.82 }, { month: '2025-06', rate: 2.10 },
  { month: '2025-07', rate: 3.35 }, { month: '2025-08', rate: 3.65 },
  { month: '2025-09', rate: 3.83 }, { month: '2025-10', rate: 0.25 },
  { month: '2025-11', rate: 0.71 }, { month: '2025-12', rate: 1.33 },
  { month: '2026-01', rate: 2.75 },
];

const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });

const fetchFromDataGovIn = async () => {
  // Fix: API key read from environment variable instead of hardcoded
  const apiKey = process.env.DATAGOV_API_KEY;
  if (!apiKey) throw new Error('DATAGOV_API_KEY not set in environment');

  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=24&sort[Month]=desc`;

  const json = await fetchJSON(url);
  if (!json?.records?.length) throw new Error('No records returned');

  const records = json.records
    .filter(r => r['Inflation Rate (YoY)'] !== undefined || r['inflation_rate'] !== undefined)
    .map(r => {
      const rawRate  = r['Inflation Rate (YoY)'] ?? r['inflation_rate'] ?? r['Rate'];
      const rawMonth = r['Month'] ?? r['month'] ?? r['Date'];
      return { rate: parseFloat(rawRate), month: String(rawMonth) };
    })
    .filter(r => !isNaN(r.rate))
    .sort((a, b) => b.month.localeCompare(a.month));

  if (!records.length) throw new Error('No parseable CPI records');
  return records;
};

const getLiveInflationRate = async () => {
  if (cache.rate !== null && cache.fetchedAt && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { rate: cache.rate, month: cache.month, source: 'cache', historical: cache.historical, fetchedAt: cache.fetchedAt };
  }

  try {
    const records = await fetchFromDataGovIn();
    const latest = records[0];
    const historical = records.slice(0, 13).reverse();
    cache = { rate: latest.rate, month: latest.month, fetchedAt: Date.now(), historical };
    return { rate: latest.rate, month: latest.month, source: 'live', historical, fetchedAt: cache.fetchedAt };
  } catch (err) {
    console.warn('[InflationService] Live fetch failed:', err.message);
  }

  if (cache.rate !== null) {
    return { rate: cache.rate, month: cache.month, source: 'cache', historical: cache.historical, fetchedAt: cache.fetchedAt };
  }

  const fallbackLatest = HISTORICAL_FALLBACK[HISTORICAL_FALLBACK.length - 1];
  return {
    rate: fallbackLatest.rate,
    month: fallbackLatest.month,
    source: 'fallback',
    historical: HISTORICAL_FALLBACK.slice(-13),
    fetchedAt: null,
  };
};

const inflationAdjustedAmount = (presentAmount, annualRatePercent, years) => {
  const r = annualRatePercent / 100;
  return presentAmount * Math.pow(1 + r, years);
};

const purchasingPowerDecay = (amount, annualRatePercent, years) => {
  const r = annualRatePercent / 100;
  return amount / Math.pow(1 + r, years);
};

const realReturn = (nominalReturnPercent, inflationPercent) => {
  const n = nominalReturnPercent / 100;
  const i = inflationPercent / 100;
  return ((1 + n) / (1 + i) - 1) * 100;
};

const inflationAdjustedGoalSIP = (nominalTarget, inflationRate, years, expectedAnnualReturn = 7) => {
  const realTarget = inflationAdjustedAmount(nominalTarget, inflationRate, years);
  const monthlyRate = expectedAnnualReturn / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return realTarget / n;
  const sip = (realTarget * monthlyRate) / (Math.pow(1 + monthlyRate, n) - 1);
  return Math.ceil(sip);
};

module.exports = {
  getLiveInflationRate,
  inflationAdjustedAmount,
  purchasingPowerDecay,
  realReturn,
  inflationAdjustedGoalSIP,
  RBI_TARGET_RATE,
};
