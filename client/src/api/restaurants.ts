import type { RestaurantJson } from "../types/restaurant";

export type FetchRestaurantsResult =
  | { ok: true; restaurants: RestaurantJson[] }
  | { ok: false; error: string };

export async function fetchRestaurantsByCity(
  city: string,
): Promise<FetchRestaurantsResult> {
  const res = await fetch(
    `/api/restaurants?city=${encodeURIComponent(city)}`,
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      error: typeof data?.error === "string" ? data.error : "Request failed.",
    };
  }
  return {
    ok: true,
    restaurants: Array.isArray(data) ? data : [],
  };
}
