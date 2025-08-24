/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { v4: uuidv4 } = require("uuid");

const json = (status, body) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    // CORS: set your origins in prod; '*' is okay during dev
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

    const body = event.body ? JSON.parse(event.body) : {};
    const { type, text, lat, lng, areaCode } = body || {};

    console.log("Creating report:", { type, lat, lng, areaCode, textLength: text?.length || 0 });

    // Basic validation
    const TYPES = new Set(["lighting", "harassment", "theft", "other", "crowd", "crowd_low"]);
    if (!type || !TYPES.has(String(type))) {
      return json(400, { error: "Invalid 'type'. Allowed: lighting|harassment|theft|other|crowd|crowd_low" });
    }
    const latNum = Number(lat), lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return json(400, { error: "Invalid lat/lng" });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const textClean = (text && String(text).slice(0, 2000)) || "";

    // Log the report instead of writing to DynamoDB
    console.log(`Report ${id} created:`, {
      id,
      type: String(type),
      text: textClean,
      lat: latNum,
      lng: lngNum,
      areaCode: areaCode || null,
      createdAt,
      status: "logged_only"
    });

    // Return the report with generated metadata
    return json(201, { 
      id, 
      type, 
      text: textClean, 
      lat: latNum, 
      lng: lngNum, 
      areaCode: areaCode || null, 
      createdAt,
      status: "logged_only",
      message: "Report logged successfully (no persistent storage configured)"
    });
  } catch (err) {
    console.error("createReports error:", err);
    return json(500, { error: "Internal Server Error" });
  }
};
