/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

// Environment variables - these will be set during deployment
const SAFE_THRESHOLD = parseFloat(process.env.SAFE_THRESHOLD || "7.5");
const CAUTION_THRESHOLD = parseFloat(process.env.CAUTION_THRESHOLD || "4.0");
const RFS_FEED_URL = process.env.RFS_FEED_URL;

// External API endpoints
const WORLD_BANK_URL = "https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&per_page=30000";

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
  if (score >= SAFE_THRESHOLD) return "Safe";
  if (score >= CAUTION_THRESHOLD) return "Caution";
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

// Fetch country risk data from World Bank API
async function fetchCountryRiskData() {
  try {
    const resp = await fetch(WORLD_BANK_URL);
    if (!resp.ok) {
      throw new Error(`World Bank API failed: ${resp.status}`);
    }
    const json = await resp.json();
    if (!Array.isArray(json) || json.length < 2) {
      throw new Error("Unexpected World Bank response shape");
    }
    return json[1]; // rows
  } catch (error) {
    console.error("Failed to fetch country risk data:", error);
    return [];
  }
}

// Compute risk score from homicides per 100k
function computeRiskScore(homicidesPer100k) {
  const base = clamp((Number(homicidesPer100k) || 0) / 50, 0, 1);
  return round1(10 - base * 10); // 0 per-100k => 10 (safer); >=50 => ~0
}

// Get country risk score for a specific country
async function getCountryRisk(countryCode) {
  if (!countryCode) return null;
  
  try {
    const rows = await fetchCountryRiskData();
    if (!rows || rows.length === 0) return null;
    
    // Find the latest data for this country
    const countryData = rows
      .filter(r => {
        const iso2 = r?.country?.id || r?.countryiso2code || r?.countryiso2 || r?.countryCode;
        return iso2 && iso2.toUpperCase() === countryCode.toUpperCase() && r?.value != null;
      })
      .sort((a, b) => parseInt(b?.date || "0") - parseInt(a?.date || "0"));
    
    if (countryData.length === 0) return null;
    
    const latest = countryData[0];
    const score = computeRiskScore(latest.value);
    
    return {
      score,
      year: parseInt(latest.date, 10),
      source: "WorldBank/UNODC",
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting country risk:", error);
    return null;
  }
}

// Fetch live incidents from NSW RFS feed
async function fetchLiveIncidents() {
  try {
    if (!RFS_FEED_URL) {
      console.warn("RFS_FEED_URL not configured");
      return [];
    }
    
    const resp = await fetch(RFS_FEED_URL, { redirect: "follow" });
    if (!resp.ok) {
      throw new Error(`RFS feed failed: ${resp.status}`);
    }
    
    const xml = await resp.text();
    // For now, return a simple structure - in production you'd parse the XML
    return [{
      id: "sample_incident",
      type: "Fire",
      severity: "Advice",
      lat: -33.8688,
      lng: 151.2093,
      startedAt: new Date().toISOString(),
      source: "NSW RFS"
    }];
  } catch (error) {
    console.error("Failed to fetch live incidents:", error);
    return [];
  }
}

// Get nearby incidents within radius
async function getNearbyIncidents(lat, lng, radiusKm = 20) {
  try {
    const incidents = await fetchLiveIncidents();
    return incidents
      .filter(i => {
        if (typeof i.lat !== "number" || typeof i.lng !== "number") return false;
        const d = haversineKm(lat, lng, i.lat, i.lng);
        i._distanceKm = d;
        return d <= radiusKm;
      })
      .sort((a, b) => a._distanceKm - b._distanceKm)
      .map(i => ({
        id: i.id,
        type: i.type,
        severity: i.severity,
        distanceKm: round1(i._distanceKm),
        startedAt: i.startedAt,
        source: i.source,
      }));
  } catch (error) {
    console.error("Error getting nearby incidents:", error);
    return [];
  }
}

// Basic community assessment (placeholder until external DB is integrated)
function assessCommunitySafety(lat, lng, radiusKm = 2) {
  // TODO: Integrate with external community reports database
  return {
    total: 0,
    lighting: "Good",
    crowd: "High",
    penalty: 0
  };
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
  return label;
}

exports.handler = async (event) => {
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

    console.log(`Safety assessment for lat:${lat}, lng:${lng}, country:${country || 'none'}`);
    console.log(`Thresholds: Safe=${SAFE_THRESHOLD}, Caution=${CAUTION_THRESHOLD}`);

    // Get country risk data from World Bank API
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
        console.log(`Country risk score: ${baseScore} for ${country}`);
      }
    }

    // Get live incidents from NSW RFS feed
    const incidents = await getNearbyIncidents(lat, lng, 20);
    console.log(`Found ${incidents.length} nearby incidents`);

    // Community assessment (placeholder)
    const community = assessCommunitySafety(lat, lng, 2);
    let penalty = community.penalty || 0;
    if (community.lighting) breakdown.lighting = community.lighting;
    if (community.crowd) breakdown.crowd = community.crowd;

    // Final score & label
    let score = baseScore;
    if (score !== null && score !== undefined) {
      score = clamp(round1(score + penalty), 0, 10);
    }

    let label = labelFromScore(score);
    label = downgradeByIncidents(label, incidents);

    console.log(`Final safety assessment: ${label} (score: ${score}, penalty: ${penalty})`);

    // Build response
    const response = {
      location: { lat, lng, country: country || null },
      safety: {
        label,
        score: score !== null ? round1(score) : null,
        coverage,
        confidence,
        thresholds: { safe: SAFE_THRESHOLD, caution: CAUTION_THRESHOLD }
      },
      breakdown,
      incidents: incidents.length > 0 ? incidents : null,
      community: community.total > 0 ? {
        total: community.total,
        lighting: community.lighting,
        crowd: community.crowd,
        penalty: round1(community.penalty)
      } : null,
      sources: sources.length > 0 ? sources : null,
      last_updated: new Date().toISOString()
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
