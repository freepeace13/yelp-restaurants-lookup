import type { RestaurantJson } from "../types/restaurant";
import { RestaurantCard } from "./RestaurantCard";

type RestaurantListProps = {
  restaurants: RestaurantJson[];
  /** Haversine / strict filter radius from the last successful search (meters). */
  searchRadiusMeters: number | null;
};

export function RestaurantList({
  restaurants,
  searchRadiusMeters,
}: RestaurantListProps) {
  return (
    <ul className="mt-8 space-y-3">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.alias}
          restaurant={r}
          searchRadiusMeters={searchRadiusMeters}
        />
      ))}
    </ul>
  );
}
