import { useEffect, useRef, useState } from "react";
import type { CityValue } from "../types/city";
import { cityValueFromIp } from "../utils/cityFromIp";
import { getCurrentPosition } from "../utils/geolocation";
import { reverseGeocodeCityValue } from "../utils/reverseGeocode";
import { FALLBACK_CITY_VALUE } from "../utils/constants";

export function useDefaultCity() {
  const [city, setCity] = useState<CityValue | null>(null);
  const cityEditedByUser = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function discoverDefaultCity() {
      let resolved: CityValue | null = null;

      try {
        const pos = await getCurrentPosition();
        if (cancelled) return;
        resolved = await reverseGeocodeCityValue(
          pos.coords.latitude,
          pos.coords.longitude,
        );
      } catch {
        // Denied, timeout, or unavailable — try IP below.
      }

      if (cancelled || cityEditedByUser.current) return;

      if (!resolved) {
        resolved = await cityValueFromIp();
      }

      if (cancelled || cityEditedByUser.current) return;

      setCity(resolved ?? FALLBACK_CITY_VALUE);
    }

    void discoverDefaultCity();
    return () => {
      cancelled = true;
    };
  }, []);

  function markCityEditedByUser() {
    cityEditedByUser.current = true;
  }

  return { city, setCity, markCityEditedByUser };
}
