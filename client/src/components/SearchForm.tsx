import type { FormEvent } from "react";
import type { CityValue } from "../types/city";
import { CityAutocomplete } from "./CityAutocomplete";
import { MAX_RADIUS_MILES, MIN_RADIUS_MILES } from "../utils/radius";

type SearchFormProps = {
  city: CityValue | null;
  radiusMiles: number;
  loading: boolean;
  onCityChange: (value: CityValue | null) => void;
  onRadiusMilesChange: (value: number) => void;
  onSearch: (e: FormEvent) => void;
};

export function SearchForm({
  city,
  radiusMiles,
  loading,
  onCityChange,
  onRadiusMilesChange,
  onSearch,
}: SearchFormProps) {
  return (
    <form
      onSubmit={onSearch}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400" htmlFor="city">
          City
        </label>
        <CityAutocomplete
          id="city"
          value={city}
          onChange={onCityChange}
          disabled={loading}
          autoComplete="address-level2"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-32">
        <label className="text-xs font-medium text-slate-400" htmlFor="radius">
          Radius (mi)
        </label>
        <input
          id="radius"
          type="number"
          inputMode="decimal"
          min={MIN_RADIUS_MILES}
          max={MAX_RADIUS_MILES}
          step="any"
          value={radiusMiles}
          onChange={(e) => onRadiusMilesChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
