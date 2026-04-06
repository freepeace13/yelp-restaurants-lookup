import { useCallback, useEffect, useRef, useState } from "react";
import type { RestaurantJson } from "../types/restaurant";
import { fetchRestaurantsByCity } from "../api/restaurants";

export function useRestaurantSearch(strictFiltering: boolean) {
  const [restaurants, setRestaurants] = useState<RestaurantJson[]>([]);
  const [searchRadiusMeters, setSearchRadiusMeters] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const lastCityRef = useRef<string | null>(null);
  const lastRadiusMetersRef = useRef<number | null>(null);

  const search = useCallback(
    async (city: string, radiusMeters: number) => {
      const q = city.trim();
      if (!q) {
        setError("Enter a city name.");
        return;
      }
      lastCityRef.current = q;
      lastRadiusMetersRef.current = radiusMeters;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchRestaurantsByCity(
          q,
          strictFiltering,
          radiusMeters,
        );
        setSearched(true);
        if (!result.ok) {
          setRestaurants([]);
          setSearchRadiusMeters(null);
          setError(result.error);
          return;
        }
        setSearchRadiusMeters(radiusMeters);
        setRestaurants(result.restaurants);
      } catch {
        setRestaurants([]);
        setSearchRadiusMeters(null);
        setSearched(true);
        setError("Could not reach the server. Is it running on port 3001?");
      } finally {
        setLoading(false);
      }
    },
    [strictFiltering],
  );

  useEffect(() => {
    const city = lastCityRef.current;
    const radiusMeters = lastRadiusMetersRef.current;
    if (!city || radiusMeters == null) return;
    void search(city, radiusMeters);
  }, [strictFiltering, search]);

  return { restaurants, searchRadiusMeters, loading, error, searched, search };
}
