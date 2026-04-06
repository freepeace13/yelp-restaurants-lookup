import yelp from "yelp-fusion";
import { Restaurant } from "../DTOs/Restaurant.js";
import { geocodeCityCenter } from "./CityGeocode.js";
import { buildLocationRelevance, FIVE_MILES_METERS } from "../utils/geoDistance.js";

/**
 * Search params: `term` (restaurants), `radius` in meters (~5 mi from geocoded city center),
 * and `location` (city string). Yelp treats `radius` as a suggestion: in dense areas the
 * effective radius may be smaller; in sparse areas it may be larger so results stay relevant.
 * We annotate each row with Haversine distance from a geocoded city center so the UI
 * can flag listings outside the 5-mile relevance window (Yelp may still return them).
 *
 * When strict filtering is enabled (via the `strictFiltering` API option), businesses whose
 * Haversine distance from the geocoded city center exceeds the configured radius are dropped
 * (same meters as the Yelp search radius). The web app passes this; omitting it defaults to
 * non-strict behavior.
 */

/** Yelp Fusion `radius` bounds (meters). */
const YELP_MIN_RADIUS_METERS = 1;
const YELP_MAX_RADIUS_METERS = 40000;

/**
 * @param {unknown} value
 * @returns {number}
 */
function normalizeSearchRadiusMeters(value) {
    if (value === undefined || value === null) {
        return FIVE_MILES_METERS;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return FIVE_MILES_METERS;
    }
    const rounded = Math.round(n);
    return Math.min(
        YELP_MAX_RADIUS_METERS,
        Math.max(YELP_MIN_RADIUS_METERS, rounded),
    );
}

/** Yelp Fusion API client (`yelp-fusion`); uses https://api.yelp.com/v3 (see package). */
const getYelpClient = () => yelp.client(process.env.YELP_API_KEY);

/**
 * @param {string} city
 * @param {{ strictFiltering?: boolean, radiusMeters?: number, latitude?: number, longitude?: number }} [options]
 * If `strictFiltering` is omitted, defaults to false (not strict). Callers should pass
 * `strictFiltering` from the client (e.g. `/api/restaurants?strictFiltering=true`).
 * If `radiusMeters` is omitted, uses {@link FIVE_MILES_METERS}.
 * When `latitude` and `longitude` are finite numbers, Yelp search uses them as the center
 * (and distance filtering uses the same point); otherwise the city string is geocoded.
 */
export const listCityRestaurants = async (city, options = {}) => {
    const strictFiltering =
        typeof options.strictFiltering === 'boolean'
            ? options.strictFiltering
            : false;
    const radiusMeters = normalizeSearchRadiusMeters(options.radiusMeters);
    const lat = options.latitude;
    const lon = options.longitude;
    const explicitCenter =
        typeof lat === 'number' &&
            Number.isFinite(lat) &&
            typeof lon === 'number' &&
            Number.isFinite(lon)
            ? { latitude: lat, longitude: lon }
            : null;

    const yelpSearch = explicitCenter
        ? {
            term: 'restaurant',
            radius: radiusMeters,
            latitude: explicitCenter.latitude,
            longitude: explicitCenter.longitude,
        }
        : {
            term: 'restaurant',
            radius: radiusMeters,
            location: city,
        };

    const [searchResponse, cityCenter] = await Promise.all([
        getYelpClient().search(yelpSearch),
        explicitCenter
            ? Promise.resolve(explicitCenter)
            : geocodeCityCenter(city),
    ]);
    const businesses = searchResponse.jsonBody?.businesses ?? [];
    const restaurants = businesses.map((b) => {
        const locationRelevance = buildLocationRelevance(
            b.coordinates?.latitude,
            b.coordinates?.longitude,
            cityCenter,
            radiusMeters,
        );
        return new Restaurant(b, { locationRelevance });
    });
    if (!strictFiltering) {
        return restaurants;
    }
    return restaurants.filter(
        (r) => r.locationRelevance.withinSearchRadius !== false,
    );
};