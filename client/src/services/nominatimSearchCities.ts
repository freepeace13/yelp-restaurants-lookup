import type { CityValue } from "../types/city";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  region?: string;
  country?: string;
};

export type NominatimCityHit = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: NominatimAddress;
};

function parseAddress(addr: NominatimAddress | undefined): {
  name: string;
  state: string;
  country: string;
} {
  if (!addr) {
    return { name: "", state: "", country: "" };
  }
  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    "";
  const state = addr.state || addr.region || "";
  const country = addr.country || "";
  return { name, state, country };
}

export function cityValueFromNominatimHit(hit: NominatimCityHit): CityValue {
  const { name: addrName, state, country } = parseAddress(hit.address);
  const lat = Number.parseFloat(hit.lat);
  const lon = Number.parseFloat(hit.lon);
  const name =
    addrName.trim() ||
    (typeof hit.name === "string" ? hit.name.trim() : "") ||
    hit.display_name.split(",")[0]?.trim() ||
    hit.display_name;

  return {
    name,
    country: country.trim(),
    state: state.trim(),
    coordinates: {
      latitude: Number.isFinite(lat) ? lat : 0,
      longitude: Number.isFinite(lon) ? lon : 0,
    },
  };
}

/**
 * City search via OSM Nominatim (public instance).
 * @see https://nominatim.org/release-docs/develop/api/Search/
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<NominatimCityHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = new URL(NOMINATIM_SEARCH);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("featuretype", "city");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error(`City search failed (${res.status})`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const place_id = o.place_id;
      const display_name = o.display_name;
      const lat = o.lat;
      const lon = o.lon;
      if (
        typeof place_id !== "number" ||
        typeof display_name !== "string" ||
        typeof lat !== "string" ||
        typeof lon !== "string"
      ) {
        return null;
      }
      const name = o.name;
      let address: NominatimAddress | undefined;
      const rawAddr = o.address;
      if (rawAddr && typeof rawAddr === "object") {
        const a = rawAddr as Record<string, unknown>;
        address = {
          city: typeof a.city === "string" ? a.city : undefined,
          town: typeof a.town === "string" ? a.town : undefined,
          village: typeof a.village === "string" ? a.village : undefined,
          municipality:
            typeof a.municipality === "string" ? a.municipality : undefined,
          state: typeof a.state === "string" ? a.state : undefined,
          region: typeof a.region === "string" ? a.region : undefined,
          country: typeof a.country === "string" ? a.country : undefined,
        };
      }
      const hit: NominatimCityHit = {
        place_id,
        display_name,
        lat,
        lon,
        address,
      };
      if (typeof name === "string") {
        hit.name = name;
      }
      return hit;
    })
    .filter((x): x is NominatimCityHit => x !== null);
}
