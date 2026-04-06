export type CityCoordinates = {
  latitude: number;
  longitude: number;
};

/** Structured city selection (Nominatim-backed autocomplete). */
export type CityValue = {
  name: string;
  country: string;
  state: string;
  coordinates: CityCoordinates;
};

export function formatCityDisplay(city: CityValue): string {
  const parts = [city.name, city.state, city.country].filter(
    (p) => p.trim().length > 0,
  );
  return parts.join(", ");
}

/** Query string sent to the restaurant lookup API (location text). */
export function citySearchQuery(city: CityValue): string {
  const parts = [city.name, city.state].filter((p) => p.trim().length > 0);
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return city.name.trim() || city.country.trim();
}
