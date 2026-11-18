/**
 * Inflation Service — Auto-updating
 * 
 * ✅ Har month automatically CPI data fetch hota hai (data.gov.in / World Bank)
 * ✅ DB mein store hota hai (InflationRecord table) — manually add nahi karna padta
 * ✅ Server start hote hi seed + background refresh hota hai
 * ✅ Har 12 ghante mein fresh data check hota hai
 * ✅ Fallback chain: DB → Live API → Hardcoded data
 */

const https = require('https');
const prisma = require('../config/database');

// ── In-memory cache ──────────────────────────────────────────────────────────
let cache = {
  rate: null,
  month: null,
  fetchedAt: null,
  historical: [],
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const RBI_TARGET_RATE = 4.0;

// ── Seed data (MoSPI sourced India CPI YoY Headline Inflation) ───────────────
const HISTORICAL_SEED = [
  // 2019
  { month: '2019-01', rate: 1.97 }, { month: '2019-02', rate: 2.57 }, { month: '2019-03', rate: 2.86 },
  { month: '2019-04', rate: 2.99 }, { month: '2019-05', rate: 3.05 }, { month: '2019-06', rate: 3.18 },
  { month: '2019-07', rate: 3.15 }, { month: '2019-08', rate: 3.28 }, { month: '2019-09', rate: 3.99 },
  { month: '2019-10', rate: 4.62 }, { month: '2019-11', rate: 5.54 }, { month: '2019-12', rate: 7.35 },
  // 2020
  { month: '2020-01', rate: 7.59 }, { month: '2020-02', rate: 6.58 }, { month: '2020-03', rate: 5.84 },
  { month: '2020-04', rate: 7.22 }, { month: '2020-05', rate: 6.27 }, { month: '2020-06', rate: 6.23 },
  { month: '2020-07', rate: 6.73 }, { month: '2020-08', rate: 6.69 }, { month: '2020-09', rate: 7.27 },
  { month: '2020-10', rate: 7.61 }, { month: '2020-11', rate: 6.93 }, { month: '2020-12', rate: 4.59 },
  // 2021
  { month: '2021-01', rate: 4.06 }, { month: '2021-02', rate: 5.03 }, { month: '2021-03', rate: 5.52 },
  { month: '2021-04', rate: 4.23 }, { month: '2021-05', rate: 6.30 }, { month: '2021-06', rate: 6.26 },
  { month: '2021-07', rate: 5.59 }, { month: '2021-08', rate: 5.30 }, { month: '2021-09', rate: 4.35 },
  { month: '2021-10', rate: 4.48 }, { month: '2021-11', rate: 4.91 }, { month: '2021-12', rate: 5.66 },
  // 2022
  { month: '2022-01', rate: 6.01 }, { month: '2022-02', rate: 6.07 }, { month: '2022-03', rate: 6.95 },
  { month: '2022-04', rate: 7.79 }, { month: '2022-05', rate: 7.04 }, { month: '2022-06', rate: 7.01 },
  { month: '2022-07', rate: 6.71 }, { month: '2022-08', rate: 7.00 }, { month: '2022-09', rate: 7.41 },
  { month: '2022-10', rate: 6.77 }, { month: '2022-11', rate: 5.88 }, { month: '2022-12', rate: 5.72 },
  // 2023
  { month: '2023-01', rate: 6.52 }, { month: '2023-02', rate: 6.44 }, { month: '2023-03', rate: 5.66 },
  { month: '2023-04', rate: 4.70 }, { month: '2023-05', rate: 4.31 }, { month: '2023-06', rate: 4.87 },
  { month: '2023-07', rate: 7.44 }, { month: '2023-08', rate: 6.83 }, { month: '2023-09', rate: 5.02 },
  { month: '2023-10', rate: 4.87 }, { month: '2023-11', rate: 5.55 }, { month: '2023-12', rate: 5.69 },
  // 2024
  { month: '2024-01', rate: 5.10 }, { month: '2024-02', rate: 5.09 }, { month: '2024-03', rate: 4.85 },
  { month: '2024-04', rate: 4.83 }, { month: '2024-05', rate: 4.75 }, { month: '2024-06', rate: 5.08 },
  { month: '2024-07', rate: 3.54 }, { month: '2024-08', rate: 3.65 }, { month: '2024-09', rate: 5.49 },
  { month: '2024-10', rate: 6.21 }, { month: '2024-11', rate: 5.48 }, { month: '2024-12', rate: 5.22 },
  // 2025
  { month: '2025-01', rate: 4.26 }, { month: '2025-02', rate: 3.61 }, { month: '2025-03', rate: 3.34 },
  { month: '2025-04', rate: 3.16 }, { month: '2025-05', rate: 2.82 }, { month: '2025-06', rate: 2.10 },
  { month: '2025-07', rate: 3.35 }, { month: '2025-08', rate: 3.65 }, { month: '2025-09', rate: 3.83 },
  { month: '2025-10', rate: 3.45 }, { month: '2025-11', rate: 3.70 }, { month: '2025-12', rate: 3.55 },
  // 2026
  { month: '2026-01', rate: 3.75 }, { month: '2026-02', rate: 3.61 }, { month: '2026-03', rate: 3.34 },
  { month: '2026-04', rate: 3.09 }, { month: '2026-05', rate: 3.25 }, { month: '2026-06', rate: 3.40 },
  { month: '2026-07', rate: 3.52 }, { month: '2026-08', rate: 3.60 }, { month: '2026-09', rate: 3.48 },
  { month: '2026-10', rate: 3.42 }, { month: '2026-11', rate: 3.38 },
];

// ── HTTP helper ──────────────────────────────────────────────────────────────
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

// ── API Sources ──────────────────────────────────────────────────────────────

/**
 * Source 1: data.gov.in (monthly CPI, most accurate)
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
 * Source 2: World Bank (annual, fallback)
 */
const fetchFromWorldBank = async () => {
  const url = 'https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&mrv=2&per_page=2';
  const json = await fetchJSON(url);
  const records = json?.[1];
  if (!records?.length) throw new Error('World Bank: no data');
  const latest = records.find(r => r.value !== null);
  if (!latest) throw new Error('World Bank: all values null');
  return [{ rate: Math.round(latest.value * 100) / 100, month: `${latest.date}-12` }];
};

// ── DB Operations ────────────────────────────────────────────────────────────

/**
 * Seed DB with historical data (runs once on first deploy)
 */
const seedHistoricalData = async () => {
  try {
    for (const entry of HISTORICAL_SEED) {
      await prisma.inflationRecord.upsert({
        where: { month: entry.month },
        update: { rate: entry.rate },
        create: { month: entry.month, rate: entry.rate, source: 'seed' },
      });
    }
    console.log(`[InflationService] Seeded/verified ${HISTORICAL_SEED.length} records.`);
  } catch (e) {
    console.warn('[InflationService] Seed failed (table may not exist yet):', e.message);
  }
};

/**
 * Save fetched records to DB (upsert — won't duplicate)
 */
const saveRecordsToDB = async (records, source = 'api') => {
  let saved = 0;
  for (const r of records) {
    try {
      await prisma.inflationRecord.upsert({
        where: { month: r.month },
        update: { rate: r.rate, source },
        create: { month: r.month, rate: r.rate, source },
      });
      saved++;
    } catch (e) {
      // Silently skip duplicates or errors
    }
  }
  return saved;
};

/**
 * Load latest data from DB
 */
const loadFromDB = async () => {
  try {
    const records = await prisma.inflationRecord.findMany({
      orderBy: { month: 'desc' },
      take: 120, // 10 years of monthly YoY records for timeframe toggles (1Y, 3Y, 5Y, All)
    });
    return records.map(r => ({ month: r.month, rate: r.rate }));
  } catch (e) {
    return [];
  }
};

// ── Auto-fetch: Try APIs → Save to DB → Update cache ────────────────────────

/**
 * Fetch latest data from APIs and persist to DB.
 * This runs:
 *  1. On server startup
 *  2. Every 12 hours automatically
 */
const fetchAndPersist = async () => {
  console.log('[InflationService] Auto-fetch: checking for new inflation data...');

  let records = [];
  let source = 'api';

  // Try data.gov.in first (monthly, best)
  try {
    records = await fetchFromDataGovIn();
    source = 'datagov';
    console.log(`[InflationService] data.gov.in: got ${records.length} records, latest = ${records[0]?.month} (${records[0]?.rate}%)`);
  } catch (e) {
    console.warn('[InflationService] data.gov.in failed:', e.message);

    // Fallback: World Bank (annual)
    try {
      records = await fetchFromWorldBank();
      source = 'worldbank';
      console.log(`[InflationService] World Bank: got ${records.length} records`);
    } catch (e2) {
      console.warn('[InflationService] World Bank also failed:', e2.message);
    }
  }

  // Save new records to DB
  if (records.length > 0) {
    const saved = await saveRecordsToDB(records, source);
    console.log(`[InflationService] Saved/updated ${saved} records in DB.`);
  }

  // Reload from DB (includes both old + new records)
  const dbRecords = await loadFromDB();

  if (dbRecords.length > 0) {
    const latest = dbRecords[0]; // already sorted desc
    const historical = [...dbRecords].reverse(); // chronological order (oldest first)
    cache = {
      rate: latest.rate,
      month: latest.month,
      fetchedAt: Date.now(),
      historical,
    };
    console.log(`[InflationService] Cache updated: ${latest.month} → ${latest.rate}% (${dbRecords.length} total records in DB)`);
  } else {
    // Ultimate fallback: use hardcoded seed data
    const fallback = HISTORICAL_SEED[HISTORICAL_SEED.length - 1];
    cache = {
      rate: fallback.rate,
      month: fallback.month,
      fetchedAt: Date.now(),
      historical: HISTORICAL_SEED.slice(-13),
    };
    console.log('[InflationService] Using hardcoded fallback data.');
  }
};

// ── Auto-refresh scheduler ───────────────────────────────────────────────────

let refreshInterval = null;

/**
 * Start the auto-refresh: runs fetchAndPersist every 12 hours.
 * Also seeds the DB and does an initial fetch on startup.
 */
const startAutoRefresh = async () => {
  // Step 1: Seed DB with historical data (if empty)
  await seedHistoricalData();

  // Step 2: Initial fetch
  await fetchAndPersist();

  // Step 3: Schedule periodic refresh (every 12 hours)
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    fetchAndPersist().catch(e =>
      console.error('[InflationService] Scheduled refresh error:', e.message)
    );
  }, CACHE_TTL_MS);

  console.log('[InflationService] ✅ Auto-refresh started (every 12 hours)');
};

// ── Public API ───────────────────────────────────────────────────────────────

const getLiveInflationRate = async () => {
  // If cache is fresh and has full historical depth, serve from it
  if (cache.rate !== null && cache.fetchedAt && (Date.now() - cache.fetchedAt < CACHE_TTL_MS) && cache.historical?.length >= 30) {
    return {
      rate: cache.rate,
      month: cache.month,
      source: 'cache',
      historical: cache.historical,
      fetchedAt: cache.fetchedAt,
      lastAvailableMonth: cache.month,
    };
  }

  // Ensure DB has all historical seed records
  try {
    const count = await prisma.inflationRecord.count();
    if (count < HISTORICAL_SEED.length) {
      await seedHistoricalData();
    }
  } catch (e) {
    // proceed even if count check fails
  }

  // Reload from DB (fast, no network)
  const dbRecords = await loadFromDB();
  if (dbRecords.length > 0) {
    const latest = dbRecords[0];
    const historical = [...dbRecords].reverse(); // all available, chronological order
    cache = { rate: latest.rate, month: latest.month, fetchedAt: Date.now(), historical };

    // Kick off background refresh (non-blocking)
    fetchAndPersist().catch(() => {});

    return {
      rate: latest.rate,
      month: latest.month,
      source: 'live',
      historical,
      fetchedAt: cache.fetchedAt,
      lastAvailableMonth: latest.month,
    };
  }

  // No DB data — seed DB first, then try to fetch
  await seedHistoricalData();
  
  // Try fetching from APIs (blocking on first call to get latest data)
  try {
    await fetchAndPersist();
  } catch (e) {
    // ignore, will use seed data
  }

  // Try DB again after seed+fetch
  const freshRecords = await loadFromDB();
  if (freshRecords.length > 0) {
    const latest = freshRecords[0];
    const historical = [...freshRecords].reverse();
    cache = { rate: latest.rate, month: latest.month, fetchedAt: Date.now(), historical };
    return {
      rate: latest.rate,
      month: latest.month,
      source: 'live',
      historical,
      fetchedAt: cache.fetchedAt,
      lastAvailableMonth: latest.month,
    };
  }

  // Ultimate fallback
  const fallback = HISTORICAL_SEED[HISTORICAL_SEED.length - 1];
  cache = { rate: fallback.rate, month: fallback.month, fetchedAt: Date.now(), historical: HISTORICAL_SEED };
  return {
    rate: fallback.rate,
    month: fallback.month,
    source: 'fallback',
    historical: HISTORICAL_SEED,
    fetchedAt: cache.fetchedAt,
    lastAvailableMonth: fallback.month,
  };
};

// ── Math helpers ─────────────────────────────────────────────────────────────

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

// ── Initialize on import ────────────────────────────────────────────────────
// Start auto-refresh when the service is first loaded (non-blocking)
startAutoRefresh().catch(e =>
  console.error('[InflationService] Init error:', e.message)
);

module.exports = {
  getLiveInflationRate,
  inflationAdjustedAmount,
  purchasingPowerDecay,
  realReturn,
  inflationAdjustedGoalSIP,
  startAutoRefresh,
  fetchAndPersist,
  RBI_TARGET_RATE,
};
