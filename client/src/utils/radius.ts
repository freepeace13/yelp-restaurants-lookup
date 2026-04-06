/** US statute miles → meters (1 mi = 1609.344 m). Yelp `radius` max is 40000 m. */
export const DEFAULT_RADIUS_MILES = 5;

const METERS_PER_MILE = 1609.344;
const YELP_MAX_RADIUS_METERS = 40000;

/** ~25 mi — upper bound aligned with Yelp Fusion API. */
export const MAX_RADIUS_MILES = YELP_MAX_RADIUS_METERS / METERS_PER_MILE;

/** Lower bound for UX (~400 m). */
export const MIN_RADIUS_MILES = 0.25;

export function milesToMeters(miles: number): number {
  return Math.min(
    YELP_MAX_RADIUS_METERS,
    Math.max(1, Math.round(miles * METERS_PER_MILE)),
  );
}

/** Display miles for a radius returned from the API (integer meters → mi). */
export function formatRadiusMilesFromMeters(meters: number): string {
  const mi = meters / METERS_PER_MILE;
  const roundedTenth = Math.round(mi * 10) / 10;
  return Number.isInteger(roundedTenth)
    ? String(roundedTenth)
    : roundedTenth.toFixed(1);
}
