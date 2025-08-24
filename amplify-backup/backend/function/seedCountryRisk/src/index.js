/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

// Environment variables - these will be set during deployment
const SAFE_THRESHOLD = parseFloat(process.env.SAFE_THRESHOLD || "7.5");
const CAUTION_THRESHOLD = parseFloat(process.env.CAUTION_THRESHOLD || "4.0");

// World Bank API: Intentional homicides (per 100k), code VC.IHR.PSRC.P5
const WB_URL = "https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&per_page=30000";

// Helpers
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (n) => Math.round(n * 10) / 10;

async function fetchWorldBankAll() {
  // Node 18 has global fetch
  const resp = await fetch(WB_URL);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`World Bank fetch failed: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  // Format: [meta, rows]
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error("Unexpected World Bank response shape");
  }
  return json[1]; // rows
}

function computeRiskScore(homicidesPer100k) {
  // Scale homicides to [0..1] with 50/100k as the cap, then invert to 10..0
  const base = clamp((Number(homicidesPer100k) || 0) / 50, 0, 1);
  return round1(10 - base * 10); // 0 per-100k => 10 (safer); >=50 => ~0
}

function pickLatestPerCountry(rows) {
  // rows contain multiple years per country; pick the latest non-null value per ISO2
  const latest = new Map(); // iso2 -> { countryCode, riskScore, year, source, lastUpdated }
  const nowISO = new Date().toISOString();

  for (const r of rows) {
    const iso2 = r?.country?.id || r?.countryiso2code || r?.countryiso2 || r?.countryCode;
    const value = r?.value;
    const yearStr = r?.date;
    if (!iso2 || value == null || !yearStr) continue;

    const year = parseInt(yearStr, 10);
    const existing = latest.get(iso2);
    if (!existing || year > existing.year) {
      latest.set(iso2, {
        countryCode: String(iso2).toUpperCase(),
        riskScore: computeRiskScore(value),
        year,
        source: "WorldBank/UNODC",
        lastUpdated: nowISO,
      });
    }
  }
  return Array.from(latest.values());
}

const json = (status, body) => ({
  statusCode: status,
  headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    
    console.log("Starting country risk data fetch...");
    console.log(`Safe threshold: ${SAFE_THRESHOLD}, Caution threshold: ${CAUTION_THRESHOLD}`);
    
    const rows = await fetchWorldBankAll();
    console.log(`Fetched ${rows.length} rows from World Bank API`);
    
    const latest = pickLatestPerCountry(rows);
    console.log(`Processed ${latest.length} unique countries`);
    
    if (!latest.length) {
      return json(200, { 
        message: "No country data available", 
        count: 0,
        data: [],
        thresholds: { safe: SAFE_THRESHOLD, caution: CAUTION_THRESHOLD }
      });
    }

    // Return the computed dataset directly instead of writing to DynamoDB
    return json(200, { 
      message: "Country risk data fetched successfully", 
      count: latest.length,
      data: latest,
      thresholds: { safe: SAFE_THRESHOLD, caution: CAUTION_THRESHOLD },
      source: "World Bank API",
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error("seedCountryRisk error:", err);
    return json(500, { 
      error: "Failed to fetch country risk data", 
      details: String(err?.message || err),
      timestamp: new Date().toISOString()
    });
  }
};
