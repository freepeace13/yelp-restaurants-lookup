import type { RestaurantJson } from "../types/restaurant";

export type FetchRestaurantsResult =
  | { ok: true; restaurants: RestaurantJson[] }
  | { ok: false; error: string };

export async function fetchRestaurantsByCity(
  city: string,
  strictFiltering: boolean,
): Promise<FetchRestaurantsResult> {
  const params = new URLSearchParams({
    city,
    strictFiltering: strictFiltering ? "true" : "false",
  });
  const res = await fetch(`/api/restaurants?${params.toString()}`);
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
