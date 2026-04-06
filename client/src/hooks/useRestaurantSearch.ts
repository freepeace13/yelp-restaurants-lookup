import { useState } from "react";
import type { RestaurantJson } from "../types/restaurant";
import { fetchRestaurantsByCity } from "../api/restaurants";

export function useRestaurantSearch() {
  const [restaurants, setRestaurants] = useState<RestaurantJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(city: string) {
    const q = city.trim();
    if (!q) {
      setError("Enter a city name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRestaurantsByCity(q);
      setSearched(true);
      if (!result.ok) {
        setRestaurants([]);
        setError(result.error);
        return;
      }
      setRestaurants(result.restaurants);
    } catch {
      setRestaurants([]);
      setSearched(true);
      setError("Could not reach the server. Is it running on port 3001?");
    } finally {
      setLoading(false);
    }
  }

  return { restaurants, loading, error, searched, search };
}
