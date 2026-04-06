import type { CityValue } from "../types/city";

export async function reverseGeocodeCity(
  lat: number,
  lon: number,
): Promise<string | null> {
  const detail = await reverseGeocodeCityValue(lat, lon);
  if (!detail) return null;
  const { name, state } = detail;
  if (name && state) return `${name}, ${state}`;
  if (name) return name;
  return null;
}

export async function reverseGeocodeCityValue(
  lat: number,
  lon: number,
): Promise<CityValue | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    address?: Record<string, string | undefined>;
  };
  const addr = data.address;
  if (!addr) return null;
  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    "";
  const state = (addr.state || addr.region || "").trim();
  const country = (addr.country || "").trim();
  if (!name.trim() && !country) return null;
  return {
    name: name.trim() || country,
    country,
    state,
    coordinates: { latitude: lat, longitude: lon },
  };
}
