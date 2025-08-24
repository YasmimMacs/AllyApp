/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_COMMUNITYREPORTS_ARN
	STORAGE_COMMUNITYREPORTS_NAME
	STORAGE_COMMUNITYREPORTS_STREAMARN
	STORAGE_DYNAMOC6B731C4_ARN
	STORAGE_DYNAMOC6B731C4_NAME
	STORAGE_DYNAMOC6B731C4_STREAMARN
	STORAGE_LIVEINCIDENTS_ARN
	STORAGE_LIVEINCIDENTS_NAME
	STORAGE_LIVEINCIDENTS_STREAMARN
Amplify Params - DO NOT EDIT */

// ===== Top of file (insert if not present) =====
const SAFE = parseFloat(process.env.SAFE_THRESHOLD || "7.5");
const CAUT = parseFloat(process.env.CAUTION_THRESHOLD || "4.0");
const TABLE_COUNTRY_RISK = process.env.TABLE_COUNTRY_RISK;
const TABLE_LIVE_INCIDENTS = process.env.TABLE_LIVE_INCIDENTS;
const TABLE_COMMUNITY_REPORTS = process.env.TABLE_COMMUNITY_REPORTS;
const RFS_FEED_URL = process.env.RFS_FEED_URL;

// ===== Imports =====
import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Node 18 has global fetch; no extra polyfill required.

const ddb = new DynamoDBClient({});

const json = (status, body) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  },
  body: JSON.stringify(body),
});

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (n) => Math.round(n * 10) / 10;

function labelFromScore(score) {
  if (score === null || score === undefined || Number.isNaN(score)) return "Unknown";
  if (score >= SAFE) return "Safe";
  if (score >= CAUT) return "Caution";
  return "Unsafe";
}

// Haversine in KM
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Basic heuristics to assess community penalties from a list
function communityPenalty(reports) {
  if (!reports || reports.length === 0) return { delta: 0, lighting: null, crowd: null };
  const last30 = reports;
  const lightingNeg = last30.filter(r => r.type === "lighting").length;
  const crowdLow   = last30.filter(r => r.type === "crowd_low" || r.type === "crowd").length;

  let delta = 0;
  let lighting = null;
  let crowd = null;

  if (lightingNeg >= 2) { // tune threshold
    delta -= 0.7;
    lighting = "Poor";
  } else if (lightingNeg > 0) {
    lighting = "Poor";
  } else {
    lighting = "Good";
  }

  if (crowdLow >= 2) {
    delta -= 0.5;
    crowd = "Low";
  } else if (crowdLow > 0) {
    crowd = "Low";
  } else {
    crowd = "High";
  }

  return { delta, lighting, crowd };
}

async function getCountryRisk(countryCode) {
  if (!TABLE_COUNTRY_RISK || !countryCode) return null;
  const out = await ddb.send(new GetItemCommand({
    TableName: TABLE_COUNTRY_RISK,
    Key: { countryCode: { S: countryCode.toUpperCase() } },
  }));
  if (!out.Item) return null;
  const item = unmarshall(out.Item);
  // item.riskScore is 0..10 (higher = safer)
  return {
    score: typeof item.riskScore === "number" ? item.riskScore : Number(item.riskScore),
    year: item.year,
    source: item.source || "WorldBank/UNODC",
    lastUpdated: item.lastUpdated || null,
  };
}

async function nearbyIncidents(lat, lng, radiusKm = 20) {
  if (!TABLE_LIVE_INCIDENTS) return [];
  // MVP: small Scan + client-side distance filter.
  // For larger scale, switch to a geo-indexed pattern or partitioned scans.
  const out = await ddb.send(new ScanCommand({
    TableName: TABLE_LIVE_INCIDENTS,
    // Optional: reduce payload size by ProjectionExpression (id,type,severity,lat,lng,startedAt,source,expiresAtTTL)
  }));
  const nowEpoch = Math.floor(Date.now() / 1000);
  const items = (out.Items || []).map(unmarshall).filter(i => {
    // respect TTL if present
    if (i.expiresAtTTL && Number(i.expiresAtTTL) < nowEpoch) return false;
    if (typeof i.lat !== "number" || typeof i.lng !== "number") return false;
    const d = haversineKm(lat, lng, i.lat, i.lng);
    i._distanceKm = d;
    return d <= radiusKm;
  });
  // sort by distance asc
  items.sort((a,b) => a._distanceKm - b._distanceKm);
  // Map to minimal shape
  return items.map(i => ({
    id: i.id,
    type: i.type,
    severity: i.severity,
    distanceKm: round1(i._distanceKm),
    startedAt: i.startedAt || null,
    source: i.source || "NSW RFS",
  }));
}

async function nearbyCommunityReports(lat, lng, radiusKm = 2, days = 30) {
  if (!TABLE_COMMUNITY_REPORTS) return [];
  const out = await ddb.send(new ScanCommand({ TableName: TABLE_COMMUNITY_REPORTS }));
  const since = Date.now() - days * 24 * 3600 * 1000;
  return (out.Items || [])
    .map(unmarshall)
    .filter(r => {
      if (!r.createdAt) return false;
      const t = Date.parse(r.createdAt);
      if (Number.isNaN(t) || t < since) return false;
      if (typeof r.lat !== "number" || typeof r.lng !== "number") return false;
      return haversineKm(lat, lng, r.lat, r.lng) <= radiusKm;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function downgradeByIncidents(label, incidents) {
  if (!incidents || incidents.length === 0) return label;
  const sev = incidents[0]?.severity?.toLowerCase() || "";
  // If any high-severity incident nearby, at least Caution; "Emergency Warning" => Unsafe
  const hasEmergency = incidents.some(i => (i.severity || "").toLowerCase().includes("emergency"));
  if (hasEmergency) return "Unsafe";
  if (["watch and act", "watch-and-act", "warning"].some(s => sev.includes(s))) {
    return (label === "Safe") ? "Caution" : label;
  }
  // "Advice" → keep label as-is (or optionally bump down Safe->Caution)
  return label;
}

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return json(200, { ok: true });
    }
    const q = event.queryStringParameters || {};
    const lat = parseFloat(q.lat);
    const lng = parseFloat(q.lng);
    let country = (q.country || "").toUpperCase();

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return json(400, { error: "lat,lng required" });
    }

    // Base: CountryRisk (global fallback)
    let baseScore = null;
    let coverage = "NONE";
    let confidence = "low";
    const sources = [];
    const breakdown = {};

    if (country) {
      const cr = await getCountryRisk(country);
      if (cr && typeof cr.score === "number") {
        baseScore = clamp(round1(cr.score), 0, 10);
        coverage = "COUNTRY";
        confidence = "low";
        sources.push({ name: cr.source || "WorldBank/UNODC", year: cr.year });
        breakdown.country_risk = baseScore;
      }
    }

    // (Future) If AU with local LGA metrics, replace baseScore/coverage/confidence here.

    // Community + Incidents
    const [incidents, reports] = await Promise.all([
      nearbyIncidents(lat, lng, 20),
      nearbyCommunityReports(lat, lng, 2, 30),
    ]);

    // Community penalties
    let penalty = 0;
    const com = communityPenalty(reports);
    penalty += com.delta;
    if (com.lighting) breakdown.lighting = com.lighting;
    if (com.crowd) breakdown.crowd = com.crowd;

    // Final score & label
    let score = baseScore;
    if (score !== null && score !== undefined) {
      score = clamp(round1(score + penalty), 0, 10);
    }

    let label = labelFromScore(score);
    label = downgradeByIncidents(label, incidents);

    // Build response
    const response = {
      location: { lat, lng, country: country || null },
      safety: {
        label,
        score: score !== null ? round1(score) : null,
        coverage,
        confidence,
        thresholds: { safe: SAFE, caution: CAUT }
      },
      breakdown,
      incidents: incidents.length > 0 ? incidents : null,
      community: reports.length > 0 ? {
        total: reports.length,
        lighting: com.lighting,
        crowd: com.crowd,
        penalty: round1(com.delta)
      } : null,
      sources: sources.length > 0 ? sources : null,
      timestamp: new Date().toISOString()
    };

    return json(200, response);

  } catch (error) {
    console.error("Safety assessment error:", error);
    return json(500, { 
      error: "Internal server error", 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
