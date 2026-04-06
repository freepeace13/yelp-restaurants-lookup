import type { CityValue } from "../types/city";

export async function cityFromIp(): Promise<string | null> {
  const v = await cityValueFromIp();
  if (!v) return null;
  const { name, state } = v;
  if (name && state) return `${name}, ${state}`;
  if (name) return name;
  return null;
}

export async function cityValueFromIp(): Promise<CityValue | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      region?: string;
      region_code?: string;
      country_name?: string;
      latitude?: number;
      longitude?: number;
    };
    const lat = data.latitude;
    const lon = data.longitude;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const name = (data.city || "").trim();
    const state = (data.region || data.region_code || "").trim();
    const country = (data.country_name || "").trim();
    if (!name && !country) return null;
    return {
      name: name || country,
      country,
      state,
      coordinates: { latitude: lat, longitude: lon },
    };
  } catch {
    return null;
  }
}
