/**
 * * TECHNICAL CHALLENGE:
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

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { listCityRestaurants } from "./Services/RestaurantLookup.js";

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

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

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
    latRaw === '' ||
    lonRaw === ''
  ) {
    return {
      ok: false,
      error:
        'latitude and longitude must both be provided when using coordinates',
    };
  }
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: 'latitude and longitude must be numbers' };
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { ok: false, error: 'latitude or longitude out of valid range' };
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

app.get("/api/restaurants", async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  const radiusParsed = parseRadiusMeters(req);
  if (!radiusParsed.ok) {
    return res.status(400).json({ error: radiusParsed.error });
  }
  const llParsed = parseLatitudeLongitude(req);
  if (!llParsed.ok) {
    return res.status(400).json({ error: llParsed.error });
  }
  try {
    const strictFiltering = parseStrictFiltering(req);
    const restaurants = await listCityRestaurants(city, {
      ...(strictFiltering !== undefined ? { strictFiltering } : {}),
      ...(radiusParsed.value !== undefined
        ? { radiusMeters: radiusParsed.value }
        : {}),
      ...(llParsed.value
        ? {
          latitude: llParsed.value.latitude,
          longitude: llParsed.value.longitude,
        }
        : {}),
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
