// Environment variables - these will be set during deployment
const RFS_FEED_URL = process.env.RFS_FEED_URL;

const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: true,
  trimValues: true,
});

function tryFloat(x) {
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : null;
}

// Normalize severity to a stable string (useful for /safety logic)
function normalizeSeverity(s) {
  if (!s) return "Advice";
  const t = String(s).toLowerCase();
  if (t.includes("emergency")) return "Emergency Warning";
  if (t.includes("watch")) return "Watch and Act";
  if (t.includes("advice")) return "Advice";
  if (t.includes("warning")) return "Warning";
  return s;
}

// Extract items from GeoRSS/CAP Atom-like feeds
function extractItems(xml) {
  // Accept both <entry> (Atom) and <item> (RSS) shapes
  const feed = parser.parse(xml);

  const entries = []
    .concat(feed?.feed?.entry || [])
    .concat(feed?.rss?.channel?.item || []);

  const out = [];

  for (const e of entries) {
    // Try to build a stable id
    const id = e.id || e.guid || e?.["cap:identifier"] || e?.identifier || e?.title;
    if (!id) continue;

    // Title/summary may contain incident type/severity
    const title = e.title?.["#text"] || e.title || "";
    const summary = e.summary?.["#text"] || e.description || "";

    // CAP fields (if present)
    const cap = e["cap:info"] || e.info || {};
    const capEvent = cap?.event || "";
    const capSeverity = cap?.severity || cap?.urgency || "";

    // Geo fields: some feeds use georss:point or lat/long tags
    let lat = null, lng = null;
    const geoPoint = e["georss:point"] || e["geo:point"] || e.point;
    if (typeof geoPoint === "string") {
      const parts = geoPoint.split(/\s+/);
      lat = tryFloat(parts[0]);
      lng = tryFloat(parts[1]);
    } else {
      // CAP polygon/area parsing could be added later; start with points
      lat = tryFloat(e["geo:lat"] || e["lat"] || cap?.area?.circle?.split(" ")?.[0]);
      lng = tryFloat(e["geo:long"] || e["long"] || cap?.area?.circle?.split(" ")?.[1]);
    }

    // If still missing coords, skip
    if (lat == null || lng == null) continue;

    const when =
      e.updated || e.published || e.pubDate || cap?.effective || cap?.onset || null;

    // Type/severity guess: prefer CAP event/severity, fallback to title/summary
    const type = String(capEvent || title).trim();
    const severity = normalizeSeverity(capSeverity || title || summary);

    out.push({
      id: String(id),
      type,
      severity,
      lat,
      lng,
      startedAt: when ? new Date(when).toISOString() : null,
      source: "NSW RFS",
    });
  }

  return out;
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
    
    // Validate required environment variables
    if (!RFS_FEED_URL) {
      throw new Error("Missing required environment variable: RFS_FEED_URL");
    }

    console.log("Starting NSW RFS feed ingestion...");
    console.log(`Fetching from: ${RFS_FEED_URL}`);
    
    const resp = await fetch(RFS_FEED_URL, { redirect: "follow" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Feed fetch failed: ${resp.status} ${text}`);
    }

    const xml = await resp.text();
    console.log(`Fetched ${xml.length} characters of XML data`);
    
    const items = extractItems(xml);
    console.log(`Extracted ${items.length} incidents from feed`);

    // Return the incidents directly instead of writing to DynamoDB
    return json(200, { 
      message: "NSW RFS feed ingested successfully", 
      count: items.length,
      incidents: items,
      source: "NSW RFS",
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error("ingestNSWRFS error:", err);
    return json(500, { 
      error: "Failed to ingest NSW RFS feed", 
      details: String(err?.message || err),
      timestamp: new Date().toISOString()
    });
  }
};
