/**
 * HTTP query parsing for GET /api/restaurants.
 * Pure functions — no Express types required beyond `req.query` shape.
 */

/** @param {import('express').Request} req */
function parseStrictFiltering(req) {
  const q = req.query.strictFiltering;
  if (q === "true" || q === "1") return true;
  if (q === "false" || q === "0") return false;
  return undefined;
}

/** @returns {{ ok: true, value: { latitude: number, longitude: number } | null } | { ok: false, error: string }} */
function parseLatitudeLongitude(req) {
  const latRaw = req.query.latitude;
  const lonRaw = req.query.longitude;
  if (latRaw === undefined && lonRaw === undefined) {
    return { ok: true, value: null };
  }
  if (
    latRaw === undefined ||
    lonRaw === undefined ||
    latRaw === "" ||
    lonRaw === ""
  ) {
    return {
      ok: false,
      error:
        "latitude and longitude must both be provided when using coordinates",
    };
  }
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: "latitude and longitude must be numbers" };
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { ok: false, error: "latitude or longitude out of valid range" };
  }
  return { ok: true, value: { latitude: lat, longitude: lon } };
}

/** @returns {{ ok: true, value: number | undefined } | { ok: false, error: string }} */
function parseRadiusMeters(req) {
  const q = req.query.radiusMeters;
  if (q === undefined || q === "") {
    return { ok: true, value: undefined };
  }
  const n = Number(q);
  if (!Number.isFinite(n)) {
    return { ok: false, error: "radiusMeters must be a number" };
  }
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 40000) {
    return {
      ok: false,
      error: "radiusMeters must be between 1 and 40000 (Yelp API limits)",
    };
  }
  return { ok: true, value: rounded };
}

/**
 * @param {import('express').Request} req
 * @returns {{ ok: true, value: { city: string, strictFiltering?: boolean, radiusMeters?: number, latitude?: number, longitude?: number } } | { ok: false, error: string }}
 */
export function parseRestaurantQuery(req) {
  const raw = req.query.city;
  const city =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? String(raw[0] ?? "")
        : raw != null
          ? String(raw)
          : "";
  if (!city) {
    return { ok: false, error: "City is required" };
  }

  const radiusParsed = parseRadiusMeters(req);
  if (!radiusParsed.ok) {
    return radiusParsed;
  }

  const llParsed = parseLatitudeLongitude(req);
  if (!llParsed.ok) {
    return llParsed;
  }

  const strictFiltering = parseStrictFiltering(req);

  /** @type {{ city: string, strictFiltering?: boolean, radiusMeters?: number, latitude?: number, longitude?: number }} */
  const value = { city };
  if (strictFiltering !== undefined) {
    value.strictFiltering = strictFiltering;
  }
  if (radiusParsed.value !== undefined) {
    value.radiusMeters = radiusParsed.value;
  }
  if (llParsed.value) {
    value.latitude = llParsed.value.latitude;
    value.longitude = llParsed.value.longitude;
  }

  return { ok: true, value };
}
