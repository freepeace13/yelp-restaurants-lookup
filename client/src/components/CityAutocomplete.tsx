import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  cityValueFromNominatimHit,
  searchCities,
  type NominatimCityHit,
} from "../services/nominatimSearchCities";
import { formatCityDisplay, type CityValue } from "../types/city";

const DEBOUNCE_MS = 350;

export type { CityValue } from "../types/city";

type CityAutocompleteProps = {
  id?: string;
  value: CityValue | null;
  onChange: (value: CityValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
};

export function CityAutocomplete({
  id: idProp,
  value,
  onChange,
  placeholder = "e.g. Austin, TX",
  disabled = false,
  autoComplete = "off",
  className = "",
}: CityAutocompleteProps) {
  const reactId = useId();
  const inputId = idProp ?? `city-autocomplete-${reactId}`;
  const listboxId = `${inputId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [inputText, setInputText] = useState(() =>
    value ? formatCityDisplay(value) : "",
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimCityHit[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    if (value) {
      setInputText(formatCityDisplay(value));
    }
  }, [value]);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setFetchError(null);
    try {
      const hits = await searchCities(q, ac.signal);
      setSuggestions(hits);
      setHighlightIndex(hits.length > 0 ? 0 : -1);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return;
      }
      setSuggestions([]);
      setHighlightIndex(-1);
      setFetchError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const q = inputText.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setFetchError(null);
      setLoading(false);
      setHighlightIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(inputText);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputText, runSearch]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = containerRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const showList =
    open && (suggestions.length > 0 || loading || fetchError !== null);

  function applySelection(hit: NominatimCityHit) {
    const city = cityValueFromNominatimHit(hit);
    onChange(city);
    setInputText(formatCityDisplay(city));
    setOpen(false);
    setHighlightIndex(-1);
  }

  function clearCity() {
    abortRef.current?.abort();
    onChange(null);
    setInputText("");
    setSuggestions([]);
    setFetchError(null);
    setLoading(false);
    setOpen(false);
    setHighlightIndex(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showList && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!showList) {
      if (e.key === "Escape") {
        setOpen(false);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) =>
        suggestions.length === 0
          ? -1
          : Math.min(i + 1, suggestions.length - 1),
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) =>
        suggestions.length === 0 ? -1 : Math.max(i - 1, 0),
      );
      return;
    }

    if (e.key === "Enter" && highlightIndex >= 0 && suggestions[highlightIndex]) {
      e.preventDefault();
      applySelection(suggestions[highlightIndex]);
    }
  }

  const inputClassName =
    "min-w-0 w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-3 pr-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-emerald-500/0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60";

  const showClear = value !== null || inputText.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightIndex >= 0
              ? `${listboxId}-option-${highlightIndex}`
              : undefined
          }
          value={inputText}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => {
            const next = e.target.value;
            setInputText(next);
            if (value !== null) {
              onChange(null);
            }
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={inputClassName}
        />
        {showClear && (
          <button
            type="button"
            onClick={clearCity}
            disabled={disabled}
            aria-label="Clear city"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 py-1 text-sm shadow-lg"
        >
          {fetchError && (
            <li className="px-3 py-2 text-rose-400" role="presentation">
              {fetchError}
            </li>
          )}
          {loading && suggestions.length === 0 && !fetchError && (
            <li className="px-3 py-2 text-slate-400" role="presentation">
              Searching…
            </li>
          )}
          {suggestions.map((hit, index) => (
            <li
              key={hit.place_id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === highlightIndex}
              className={`cursor-pointer px-3 py-2 text-left text-slate-200 ${
                index === highlightIndex ? "bg-slate-800" : "hover:bg-slate-800"
              }`}
              onMouseEnter={() => setHighlightIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                applySelection(hit);
              }}
            >
              {hit.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
