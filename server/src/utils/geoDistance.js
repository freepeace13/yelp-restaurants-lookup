/**
 * Great-circle distance on a sphere using the Haversine formula.
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */

/**
 * @typedef {{ assessed: boolean, distanceMiles: number | null, withinFiveMiles: boolean | null }} LocationRelevance
 */

/** WGS84 mean Earth radius (meters); common default for Haversine. */
export const EARTH_MEAN_RADIUS_METERS = 6371008.8;

/** Five US statute miles in meters (1 mi = 1609.344 m). */
export const FIVE_MILES_METERS = Math.round(5 * 1609.344);

/**
 * @param {number} degrees
 * @returns {number}
 */
export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine distance between two WGS84 lat/lon points (degrees).
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const sinΔφ2 = Math.sin(Δφ / 2);
  const sinΔλ2 = Math.sin(Δλ / 2);
  const a =
    sinΔφ2 * sinΔφ2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ2 * sinΔλ2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));

  return EARTH_MEAN_RADIUS_METERS * c;
}

/**
 * @param {number} meters
 * @returns {number}
 */
export function metersToMiles(meters) {
  return meters / 1609.344;
}

/**
 * @param {number | string | null | undefined} n
 * @returns {number | null}
 */
function toFiniteNumber(n) {
  if (n == null) return null;
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

/**
 * Compares a business position to a geocoded city center.
 * "City limits" are approximated by the 5-mile radius (no polygon data in this app).
 *
 * @param {number | string | null | undefined} businessLat
 * @param {number | string | null | undefined} businessLon
 * @param {{ latitude: number, longitude: number } | null} cityCenter
 * @param {number} [radiusMeters]
 * @returns {{ assessed: boolean, distanceMiles: number | null, withinFiveMiles: boolean | null }}
 */
export function buildLocationRelevance(
  businessLat,
  businessLon,
  cityCenter,
  radiusMeters = FIVE_MILES_METERS,
) {
  const lat = toFiniteNumber(businessLat);
  const lon = toFiniteNumber(businessLon);
  const cLat = cityCenter != null ? toFiniteNumber(cityCenter.latitude) : null;
  const cLon = cityCenter != null ? toFiniteNumber(cityCenter.longitude) : null;

  if (lat == null || lon == null || cLat == null || cLon == null) {
    return {
      assessed: false,
      distanceMiles: null,
      withinFiveMiles: null,
    };
  }

  const meters = haversineDistanceMeters(cLat, cLon, lat, lon);
  const miles = metersToMiles(meters);
  return {
    assessed: true,
    distanceMiles: Math.round(miles * 100) / 100,
    withinFiveMiles: meters <= radiusMeters,
  };
}
