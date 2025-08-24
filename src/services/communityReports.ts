export type ReportType = "lighting" | "harassment" | "theft" | "other" | "crowd" | "crowd_low";

export interface Report {
  id: string;
  type: ReportType;
  text: string;
  lat: number;
  lng: number;
  areaCode?: string | null;
  createdAt: string; // ISO string
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

function url(path: string) {
  if (!BASE_URL) throw new Error("Missing EXPO_PUBLIC_API_URL");
  return `${BASE_URL}${path}`;
}

export async function postReport(input: {
  type: ReportType;
  text?: string;
  lat: number;
  lng: number;
  areaCode?: string;
}): Promise<Report> {
  const resp = await fetch(url("/reports"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`postReport failed: ${resp.status} ${err}`);
  }

  return await resp.json();
}

export async function getReports(lat: number, lng: number, radiusKm = 2): Promise<Report[]> {
  const u = new URL(url("/reports"));
  u.searchParams.set("lat", String(lat));
  u.searchParams.set("lng", String(lng));
  u.searchParams.set("radiusKm", String(radiusKm));

  const resp = await fetch(u.toString(), { method: "GET" });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`getReports failed: ${resp.status} ${err}`);
  }

  const data = await resp.json();
  return data.items || [];
}
