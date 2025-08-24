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

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "GET") return json(405, { error: "Method Not Allowed" });
    
    const q = event.queryStringParameters || {};
    const lat = Number(q.lat), lng = Number(q.lng);
    const radiusKm = Number(q.radiusKm ?? 2);
    const days = Number(q.days ?? 30);
    const limit = Number(q.limit ?? 50);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json(400, { error: "lat,lng required" });
    }

    console.log(`Querying reports near lat:${lat}, lng:${lng}, radius:${radiusKm}km, days:${days}`);
    console.log("No persistent storage configured - returning empty result");

    // Return empty array instead of querying DynamoDB
    // TODO: Integrate with external database when available
    return json(200, { 
      items: [],
      message: "No persistent storage configured for reports",
      query: { lat, lng, radiusKm, days, limit },
      status: "no_storage"
    });
  } catch (err) {
    console.error("listReports error:", err);
    return json(500, { error: "Internal Server Error" });
  }
};
