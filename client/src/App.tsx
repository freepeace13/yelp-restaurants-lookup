import { useEffect, useRef, useState, type FormEvent } from "react";

const FALLBACK_CITY = "San Francisco";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 600_000,
    });
  });
}

async function reverseGeocodeCity(
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

async function cityFromIp(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      region_code?: string;
    };
    if (data.city && data.region_code) {
      return `${data.city}, ${data.region_code}`;
    }
    if (data.city) return data.city;
  } catch {
    return null;
  }
  return null;
}

type LocationRelevance = {
  assessed: boolean;
  distanceMiles: number | null;
  withinFiveMiles: boolean | null;
};

type RestaurantJson = {
  alias: string;
  name: string;
  rating: {
    value: number | null;
    formats: { display: string };
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    formats: { display: string };
  };
  coordinates: {
    latitude?: number | null;
    longitude?: number | null;
    formats: { display: string };
  };
  locationRelevance?: LocationRelevance;
};

export default function App() {
  const [city, setCity] = useState("");
  const cityEditedByUser = useRef(false);
  const [restaurants, setRestaurants] = useState<RestaurantJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function discoverDefaultCity() {
      let resolved: string | null = null;

      try {
        const pos = await getCurrentPosition();
        if (cancelled) return;
        resolved = await reverseGeocodeCity(
          pos.coords.latitude,
          pos.coords.longitude,
        );
      } catch {
        // Denied, timeout, or unavailable — try IP below.
      }

      if (cancelled || cityEditedByUser.current) return;

      if (!resolved) {
        resolved = await cityFromIp();
      }

      if (cancelled || cityEditedByUser.current) return;

      setCity(resolved ?? FALLBACK_CITY);
    }

    void discoverDefaultCity();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = city.trim();
    if (!q) {
      setError("Enter a city name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/restaurants?city=${encodeURIComponent(q)}`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setRestaurants([]);
        setSearched(true);
        setError(
          typeof data?.error === "string" ? data.error : "Request failed.",
        );
        return;
      }
      setSearched(true);
      setRestaurants(Array.isArray(data) ? data : []);
    } catch {
      setRestaurants([]);
      setError("Could not reach the server. Is it running on port 3001?");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            City Restaurants
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Search Yelp for restaurants in a city (via local API).
          </p>
        </header>

        <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="city">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => {
              cityEditedByUser.current = true;
              setCity(e.target.value);
            }}
            placeholder="e.g. Austin, TX"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-emerald-500/0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
            autoComplete="address-level2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <p
            className="mt-4 rounded-lg border border-red-900/80 bg-red-950/50 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        )}

        <ul className="mt-8 space-y-3">
          {restaurants.map((r) => (
            <li
              key={r.alias}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="min-w-0 flex-1 text-base font-medium text-white">
                  {r.name}
                  {r.locationRelevance?.assessed &&
                    r.locationRelevance.withinFiveMiles === false && (
                      <span
                        className="ml-2 inline-block rounded border border-amber-700/80 bg-amber-950/80 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-200"
                        title={`About ${r.locationRelevance.distanceMiles ?? "?"} mi from geocoded city center (outside 5 mi)`}
                      >
                        Outside 5 mi
                      </span>
                    )}
                </h2>
                <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-sm font-medium text-amber-300">
                  {r.rating.formats.display}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {r.address.formats.display}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {r.coordinates.formats.display}
              </p>
            </li>
          ))}
        </ul>

        {!loading && !error && restaurants.length === 0 && !searched && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Submit a city to see restaurants.
          </p>
        )}
        {!loading && !error && searched && restaurants.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No restaurants returned for that search.
          </p>
        )}
      </main>
    </div>
  );
}
