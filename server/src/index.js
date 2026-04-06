/**
 * * TECHNICAL CHALLENGE: DO NOT ERASE!
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
 */

import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const legacyStrictFiltering = process.env.STRICT_FILTERING;
if (
  legacyStrictFiltering !== undefined &&
  legacyStrictFiltering.trim() !== ""
) {
  console.warn(
    "[deprecated] STRICT_FILTERING is ignored. Use strictFiltering on GET /api/restaurants or the web app toggle.",
  );
}

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
