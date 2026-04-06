import type { FormEvent } from "react";
import { AppHeader } from "./components/AppHeader";
import { ErrorAlert } from "./components/ErrorAlert";
import { RestaurantList } from "./components/RestaurantList";
import { SearchForm } from "./components/SearchForm";
import { StrictFilteringToggle } from "./components/StrictFilteringToggle";
import { SearchStatusMessage } from "./components/SearchStatusMessage";
import { useDefaultCity } from "./hooks/useDefaultCity";
import { useRestaurantSearch } from "./hooks/useRestaurantSearch";
import { useStrictFilteringPreference } from "./hooks/useStrictFilteringPreference";

export default function App() {
  const { city, setCity, markCityEditedByUser } = useDefaultCity();
  const { strictFiltering, setStrictFiltering } =
    useStrictFilteringPreference();
  const { restaurants, loading, error, searched, search } =
    useRestaurantSearch(strictFiltering);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void search(city);
  }

  function onCityChange(value: string) {
    markCityEditedByUser();
    setCity(value);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <AppHeader />

        <SearchForm
          city={city}
          loading={loading}
          onCityChange={onCityChange}
          onSearch={onSearch}
        />

        <StrictFilteringToggle
          strictFiltering={strictFiltering}
          onStrictFilteringChange={setStrictFiltering}
        />

        {error && <ErrorAlert message={error} />}

        <RestaurantList restaurants={restaurants} />

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
