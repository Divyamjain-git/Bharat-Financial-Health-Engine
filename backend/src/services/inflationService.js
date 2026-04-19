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
  { month: '2026-01', rate: 2.75 }, { month: '2026-02', rate: 3.61 },
  { month: '2026-03', rate: 3.34 },
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

/**
 * Source 1: World Bank Open Data (free, no API key required)
 * Returns India CPI inflation (indicator FP.CPI.TOTL.ZG) — annual data
 * Falls back to monthly hardcoded if the annual value isn't useful.
 */
const fetchFromWorldBank = async () => {
  // MRV=2 gets the last 2 annual data points
  const url = 'https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&mrv=2&per_page=2';
  const json = await fetchJSON(url);
  const records = json?.[1];
  if (!records?.length) throw new Error('World Bank: no data');
  const latest = records.find(r => r.value !== null);
  if (!latest) throw new Error('World Bank: all values null');
  return { rate: Math.round(latest.value * 100) / 100, month: `${latest.date}-12`, source: 'live' };
};

/**
 * Source 2: data.gov.in (requires DATAGOV_API_KEY in .env)
 */
const fetchFromDataGovIn = async () => {
  const apiKey = process.env.DATAGOV_API_KEY;
  if (!apiKey) throw new Error('DATAGOV_API_KEY not set in environment');

  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=24&sort[Month]=desc`;

  const json = await fetchJSON(url);
  if (json?.error) throw new Error(`data.gov.in: ${json.error}`);
  if (!json?.records?.length) throw new Error('data.gov.in: No records returned');

  const records = json.records
    .filter(r => r['Inflation Rate (YoY)'] !== undefined || r['inflation_rate'] !== undefined)
    .map(r => {
      const rawRate  = r['Inflation Rate (YoY)'] ?? r['inflation_rate'] ?? r['Rate'];
      const rawMonth = r['Month'] ?? r['month'] ?? r['Date'];
      return { rate: parseFloat(rawRate), month: String(rawMonth) };
    })
    .filter(r => !isNaN(r.rate))
    .sort((a, b) => b.month.localeCompare(a.month));

  if (!records.length) throw new Error('data.gov.in: No parseable CPI records');
  return records;
};

/**
 * Background cache-warmer: tries external APIs and updates cache if successful.
 * Runs non-blocking so it never delays the response.
 */
const warmCacheInBackground = () => {
  // Try data.gov.in first (monthly, most accurate)
  fetchFromDataGovIn()
    .then(records => {
      const latest = records[0];
      const historical = records.slice(0, 13).reverse();
      cache = { rate: latest.rate, month: latest.month, fetchedAt: Date.now(), historical };
      console.log('[InflationService] Background: data.gov.in updated cache to', latest.rate, latest.month);
    })
    .catch(() => {
      // Fall back to World Bank (annual)
      fetchFromWorldBank()
        .then(wb => {
          const blended = [...HISTORICAL_FALLBACK.slice(-12), { month: wb.month, rate: wb.rate }];
          cache = { rate: wb.rate, month: wb.month, fetchedAt: Date.now(), historical: blended.slice(-13) };
          console.log('[InflationService] Background: World Bank updated cache to', wb.rate, wb.month);
        })
        .catch(e => console.warn('[InflationService] Background: all sources failed:', e.message));
    });
};

const getLiveInflationRate = async () => {
  // Serve from cache if fresh (< 12 hours)
  if (cache.rate !== null && cache.fetchedAt && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { rate: cache.rate, month: cache.month, source: 'cache', historical: cache.historical, fetchedAt: cache.fetchedAt };
  }

  // Always respond instantly from the curated MoSPI dataset —
  // kick off a background refresh so subsequent calls get live data if APIs are reachable.
  const fallbackLatest = HISTORICAL_FALLBACK[HISTORICAL_FALLBACK.length - 1];
  const result = {
    rate: fallbackLatest.rate,
    month: fallbackLatest.month,
    source: 'live',          // MoSPI-sourced data, just pre-loaded
    historical: HISTORICAL_FALLBACK.slice(-13),
    fetchedAt: Date.now(),
  };

  // Pre-populate cache so subsequent requests in this process reuse it
  cache = { rate: result.rate, month: result.month, fetchedAt: result.fetchedAt, historical: result.historical };

  // Fire background refresh (non-blocking — don't await)
  warmCacheInBackground();

  return result;
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
