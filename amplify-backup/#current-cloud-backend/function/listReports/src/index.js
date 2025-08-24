import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({});
const TABLE = process.env.TABLE_COMMUNITY_REPORTS;

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

// Haversine distance in km
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

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "GET") return json(405, { error: "Method Not Allowed" });
    if (!TABLE) return json(500, { error: "Missing env TABLE_COMMUNITY_REPORTS" });

    const q = event.queryStringParameters || {};
    const lat = Number(q.lat), lng = Number(q.lng);
    const radiusKm = Number(q.radiusKm ?? 2);
    const days = Number(q.days ?? 30);
    const limit = Number(q.limit ?? 50);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json(400, { error: "lat,lng required" });
    }

    const out = await ddb.send(new ScanCommand({
      TableName: TABLE,
      // Consider ProjectionExpression to reduce size in the future
    }));

    const since = Date.now() - days * 24 * 3600 * 1000;
    const items = (out.Items || [])
      .map(unmarshall)
      .filter(r => {
        const t = Date.parse(r.createdAt || "");
        if (!Number.isFinite(t) || t < since) return false;
        if (typeof r.lat !== "number" || typeof r.lng !== "number") return false;
        return haversineKm(lat, lng, r.lat, r.lng) <= radiusKm;
      })
      .map(r => ({
        id: r.id,
        type: r.type,
        text: r.text,
        lat: r.lat,
        lng: r.lng,
        areaCode: r.areaCode ?? null,
        createdAt: r.createdAt,
      }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);

    return json(200, { items });
  } catch (err) {
    console.error("listReports error:", err);
    return json(500, { error: "Internal Server Error" });
  }
};
