/**
 * Forward-geocode a city string to a single lat/lon using Nominatim (OpenStreetMap).
 * Used as the reference point for the 5-mile relevance check.
 */

/**
 * @param {string} city
 * @returns {Promise<{ latitude: number, longitude: number } | null>}
 */
export async function geocodeCityCenter(city) {
  const q = String(city ?? "").trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "restaurants-lookup-yelp-api/1.0 (city restaurant search)",
      },
    });
    if (!res.ok) return null;
    /** @type {Array<{ lat: string, lon: string }>} */
    const data = await res.json();
    const first = data?.[0];
    if (!first?.lat || !first?.lon) return null;
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  } catch {
    return null;
  }
}
