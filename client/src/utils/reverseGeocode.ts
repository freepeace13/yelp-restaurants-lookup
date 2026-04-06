export async function reverseGeocodeCity(
  lat: number,
  lon: number,
): Promise<string | null> {
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
  const cityName =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county;
  const state = addr.state || addr.region;
  if (cityName && state) return `${cityName}, ${state}`;
  if (cityName) return cityName;
  return null;
}
