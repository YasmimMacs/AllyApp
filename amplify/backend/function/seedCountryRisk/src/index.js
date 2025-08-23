/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({});
const TABLE_COUNTRY_RISK = process.env.TABLE_COUNTRY_RISK;

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

async function batchWriteCountryRisk(items) {
  // DynamoDB BatchWriteItem supports up to 25 items per request
  let written = 0;
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const RequestItems = {
      [TABLE_COUNTRY_RISK]: batch.map((it) => ({
        PutRequest: {
          Item: {
            countryCode: { S: it.countryCode },
            riskScore: { N: String(it.riskScore) },
            year: { N: String(it.year) },
            source: { S: it.source },
            lastUpdated: { S: it.lastUpdated },
          },
        },
      })),
    };

    const out = await ddb.send(new BatchWriteItemCommand({ RequestItems }));
    // If unprocessed items exist, retry a few times (simple backoff)
    let retries = 4;
    let unprocessed = out.UnprocessedItems?.[TABLE_COUNTRY_RISK] || [];
    while (unprocessed.length && retries > 0) {
      await new Promise((res) => setTimeout(res, 300 * (5 - retries))); // tiny backoff
      const retryReq = { RequestItems: { [TABLE_COUNTRY_RISK]: unprocessed } };
      const retryOut = await ddb.send(new BatchWriteItemCommand(retryReq));
      unprocessed = retryOut.UnprocessedItems?.[TABLE_COUNTRY_RISK] || [];
      retries--;
    }
    written += batch.length - (unprocessed.length || 0);
  }
  return written;
}

export const handler = async () => {
  try {
    if (!TABLE_COUNTRY_RISK) {
      throw new Error("Missing env TABLE_COUNTRY_RISK");
    }

    const rows = await fetchWorldBankAll();
    const latest = pickLatestPerCountry(rows);
    if (!latest.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No country items to seed (no data)", count: 0 }),
      };
    }

    const count = await batchWriteCountryRisk(latest);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Seed complete", count }),
    };
  } catch (err) {
    console.error("seedCountryRisk error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Seed failed", details: String(err?.message || err) }),
    };
  }
};
