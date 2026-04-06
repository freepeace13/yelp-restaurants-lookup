import yelp from "yelp-fusion";
import { Restaurant } from "../DTOs/Restaurant.js";
import { geocodeCityCenter } from "./CityGeocode.js";
import { buildLocationRelevance, FIVE_MILES_METERS } from "../utils/geoDistance.js";

/**
 * TECHNICAL TEST TASK:
 * 1. Build a simple JavaScript web app that: 
 * 2. Uses the Yelp API to fetch restaurants for a given city
 * 3. Has a basic web UI where a user can input a city and see results
 * 4. Displays a clean, accurate list of restaurants
 * 
 * Requirements:
 * 1. Use real Yelp API data (no mock data)
 * 2. Results should be relevant to the city (within city limits or 5-mile radius)
 * 3. Keep the solution simple and clean, avoid overengineering
 * 4. Display: name, rating, address, and coordinates
 * 5. UI can be minimal, but should be functional and easy to use
 * 
 * Submission:
 * 1. Share a live demo link (preferred) or clear instructions to run locally
 * 2. Provide your code (GitHub or file)
 * 3. Include a short explanation (3–5 sentences) of your approach
 * 4. Briefly explain how you handled accuracy and edge cases
 *
 * Search params: `term` (restaurants), `radius` in meters (~5 mi from geocoded city center),
 * and `location` (city string). Yelp treats `radius` as a suggestion: in dense areas the
 * effective radius may be smaller; in sparse areas it may be larger so results stay relevant.
 * We annotate each row with Haversine distance from a geocoded city center so the UI
 * can flag listings outside the 5-mile relevance window (Yelp may still return them).
 *
 * Set `STRICT_FILTERING=true` to drop businesses whose Haversine distance from the geocoded
 * city center exceeds the configured radius (same meters as the Yelp search radius).
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

function envStrictFilteringDefault() {
    return (
        process.env.STRICT_FILTERING === 'true' ||
        process.env.STRICT_FILTERING === '1'
    );
}

/** Yelp Fusion API client (`yelp-fusion`); uses https://api.yelp.com/v3 (see package). */
const getYelpClient = () => yelp.client(process.env.YELP_API_KEY);

/**
 * @param {string} city
 * @param {{ strictFiltering?: boolean, radiusMeters?: number }} [options]
 * If `strictFiltering` is omitted, uses `STRICT_FILTERING` from the environment.
 * If `radiusMeters` is omitted, uses {@link FIVE_MILES_METERS}.
 */
export const listCityRestaurants = async (city, options = {}) => {
    const strictFiltering =
        typeof options.strictFiltering === 'boolean'
            ? options.strictFiltering
            : envStrictFilteringDefault();
    const radiusMeters = normalizeSearchRadiusMeters(options.radiusMeters);
    const [searchResponse, cityCenter] = await Promise.all([
        getYelpClient().search({
            term: "restaurant",
            radius: radiusMeters,
            location: city,
        }),
        geocodeCityCenter(city),
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
        (r) => r.locationRelevance.withinFiveMiles !== false,
    );
};