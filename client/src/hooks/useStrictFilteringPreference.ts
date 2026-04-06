import { useCallback, useState } from "react";

const STORAGE_KEY = "restaurants-lookup-strict-filtering";

function readStored(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "true") return true;
    if (v === "false") return false;
  } catch {
    /* ignore */
  }
  return false;
}

export function useStrictFilteringPreference() {
  const [strictFiltering, setStrictFilteringState] = useState<boolean>(readStored);

  const setStrictFiltering = useCallback((value: boolean) => {
    setStrictFilteringState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  return { strictFiltering, setStrictFiltering };
}
