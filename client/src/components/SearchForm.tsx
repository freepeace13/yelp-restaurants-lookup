import type { FormEvent } from "react";

type SearchFormProps = {
  city: string;
  loading: boolean;
  onCityChange: (value: string) => void;
  onSearch: (e: FormEvent) => void;
};

export function SearchForm({
  city,
  loading,
  onCityChange,
  onSearch,
}: SearchFormProps) {
  return (
    <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="city">
        City
      </label>
      <input
        id="city"
        type="text"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        placeholder="e.g. Austin, TX"
        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-emerald-500/0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
        autoComplete="address-level2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
