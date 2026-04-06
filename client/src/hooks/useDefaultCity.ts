import { useEffect, useRef, useState } from "react";
import { FALLBACK_CITY } from "../utils/constants";
import { cityFromIp } from "../utils/cityFromIp";
import { getCurrentPosition } from "../utils/geolocation";
import { reverseGeocodeCity } from "../utils/reverseGeocode";

export function useDefaultCity() {
  const [city, setCity] = useState("");
  const cityEditedByUser = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function discoverDefaultCity() {
      let resolved: string | null = null;

      try {
        const pos = await getCurrentPosition();
        if (cancelled) return;
        resolved = await reverseGeocodeCity(
          pos.coords.latitude,
          pos.coords.longitude,
        );
      } catch {
        // Denied, timeout, or unavailable — try IP below.
      }

      if (cancelled || cityEditedByUser.current) return;

      if (!resolved) {
        resolved = await cityFromIp();
      }

      if (cancelled || cityEditedByUser.current) return;

      setCity(resolved ?? FALLBACK_CITY);
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
