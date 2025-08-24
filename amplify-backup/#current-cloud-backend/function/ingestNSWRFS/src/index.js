import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { XMLParser } from "fast-xml-parser";

const ddb = new DynamoDBClient({});
const TABLE = process.env.TABLE_LIVE_INCIDENTS;
const FEED_URL = process.env.RFS_FEED_URL;

// TTL: keep incidents ~36 hours, they auto-expire
const TTL_HOURS = 36;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: true,
  trimValues: true,
});

function epochIn(hours) {
  return Math.floor(Date.now() / 1000) + Math.floor(hours * 3600);
}

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

async function putIncident(item) {
  if (!TABLE) throw new Error("Missing env TABLE_LIVE_INCIDENTS");
  const expires = epochIn(TTL_HOURS);

  const cmd = new PutItemCommand({
    TableName: TABLE,
    Item: {
      id: { S: item.id },
      type: { S: item.type || "Incident" },
      severity: { S: item.severity || "Advice" },
      lat: { N: String(item.lat) },
      lng: { N: String(item.lng) },
      startedAt: { S: item.startedAt || new Date().toISOString() },
      source: { S: item.source || "NSW RFS" },
      expiresAtTTL: { N: String(expires) }, // DynamoDB TTL attribute
    },
  });
  await ddb.send(cmd);
}

export const handler = async () => {
  try {
    if (!FEED_URL) throw new Error("Missing env RFS_FEED_URL");

    const resp = await fetch(FEED_URL, { redirect: "follow" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Feed fetch failed: ${resp.status} ${text}`);
    }

    const xml = await resp.text();
    const items = extractItems(xml);

    // Idempotent upserts
    for (const it of items) {
      try {
        await putIncident(it);
      } catch (e) {
        console.error("PutItem failed for", it.id, e);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Ingest complete", count: items.length }),
    };
  } catch (err) {
    console.error("ingestNSWRFS error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ingest failed", details: String(err?.message || err) }),
    };
  }
};
