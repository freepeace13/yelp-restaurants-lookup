import type { RestaurantJson } from "../types/restaurant";
import { RestaurantCard } from "./RestaurantCard";

type RestaurantListProps = {
  restaurants: RestaurantJson[];
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <ul className="mt-8 space-y-3">
      {restaurants.map((r) => (
        <RestaurantCard key={r.alias} restaurant={r} />
      ))}
    </ul>
  );
}
