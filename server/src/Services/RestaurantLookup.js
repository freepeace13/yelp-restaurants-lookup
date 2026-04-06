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
 */

/** Yelp `radius` uses meters (max 40000 m). Kept in sync with {@link FIVE_MILES_METERS}. */
const YELP_RADIUS_METERS = FIVE_MILES_METERS;

/** Yelp Fusion API client (`yelp-fusion`); uses https://api.yelp.com/v3 (see package). */
const getYelpClient = () => yelp.client(process.env.YELP_API_KEY);

export const listCityRestaurants = async (city) => {
    const [searchResponse, cityCenter] = await Promise.all([
        getYelpClient().search({
            term: "restaurant",
            radius: YELP_RADIUS_METERS,
            location: city,
        }),
        geocodeCityCenter(city),
    ]);
    const businesses = searchResponse.jsonBody?.businesses ?? [];
    return businesses.map((b) => {
        const locationRelevance = buildLocationRelevance(
            b.coordinates?.latitude,
            b.coordinates?.longitude,
            cityCenter,
            FIVE_MILES_METERS,
        );
        return new Restaurant(b, { locationRelevance });
    });
};