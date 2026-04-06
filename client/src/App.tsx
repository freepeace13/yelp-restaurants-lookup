import { useState, type FormEvent } from "react";
import { AppHeader } from "./components/AppHeader";
import { ErrorAlert } from "./components/ErrorAlert";
import { RestaurantList } from "./components/RestaurantList";
import { SearchForm } from "./components/SearchForm";
import { StrictFilteringToggle } from "./components/StrictFilteringToggle";
import { SearchStatusMessage } from "./components/SearchStatusMessage";
import { useDefaultCity } from "./hooks/useDefaultCity";
import { useRestaurantSearch } from "./hooks/useRestaurantSearch";
import { useStrictFilteringPreference } from "./hooks/useStrictFilteringPreference";
import {
  DEFAULT_RADIUS_MILES,
  MAX_RADIUS_MILES,
  MIN_RADIUS_MILES,
  milesToMeters,
} from "./utils/radius";

export default function App() {
  const { city, setCity, markCityEditedByUser } = useDefaultCity();
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_MILES);
  const { strictFiltering, setStrictFiltering } =
    useStrictFilteringPreference();
  const { restaurants, searchRadiusMeters, loading, error, searched, search } =
    useRestaurantSearch(strictFiltering);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const raw = Number(radiusMiles);
    const miles = Number.isFinite(raw)
      ? Math.min(MAX_RADIUS_MILES, Math.max(MIN_RADIUS_MILES, raw))
      : DEFAULT_RADIUS_MILES;
    if (Number.isFinite(raw) && miles !== radiusMiles) {
      setRadiusMiles(miles);
    }
    void search(city, milesToMeters(miles));
  }

  function onCityChange(value: string) {
    markCityEditedByUser();
    setCity(value);
  }

  function onRadiusMilesChange(value: number) {
    if (!Number.isFinite(value)) {
      setRadiusMiles(DEFAULT_RADIUS_MILES);
      return;
    }
    setRadiusMiles(value);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <AppHeader />

        <SearchForm
          city={city}
          radiusMiles={radiusMiles}
          loading={loading}
          onCityChange={onCityChange}
          onRadiusMilesChange={onRadiusMilesChange}
          onSearch={onSearch}
        />

        <StrictFilteringToggle
          strictFiltering={strictFiltering}
          onStrictFilteringChange={setStrictFiltering}
        />

        {error && <ErrorAlert message={error} />}

        <RestaurantList
          restaurants={restaurants}
          searchRadiusMeters={searchRadiusMeters}
        />

        <SearchStatusMessage
          loading={loading}
          error={error}
          searched={searched}
          resultCount={restaurants.length}
        />
      </main>
    </div>
  );
}
