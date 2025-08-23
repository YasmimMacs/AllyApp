import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const ddb = new DynamoDBClient({});
const TABLE = process.env.TABLE_COMMUNITY_REPORTS;

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

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

    if (!TABLE) return json(500, { error: "Missing env TABLE_COMMUNITY_REPORTS" });

    const body = event.body ? JSON.parse(event.body) : {};
    const { type, text, lat, lng, areaCode } = body || {};

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

    await ddb.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        id: { S: id },
        type: { S: String(type) },
        text: { S: textClean },
        lat: { N: String(latNum) },
        lng: { N: String(lngNum) },
        areaCode: areaCode ? { S: String(areaCode) } : { NULL: true },
        createdAt: { S: createdAt },
      },
    }));

    return json(201, { id, type, text: textClean, lat: latNum, lng: lngNum, areaCode: areaCode || null, createdAt });
  } catch (err) {
    console.error("createReport error:", err);
    return json(500, { error: "Internal Server Error" });
  }
};
