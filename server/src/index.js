import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { listCityRestaurants } from "./Services/RestaurantLookup.js";

dotenv.config();

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

app.get("/api/restaurants", async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  try {
    const strictFiltering = parseStrictFiltering(req);
    const restaurants = await listCityRestaurants(city, {
      ...(strictFiltering !== undefined ? { strictFiltering } : {}),
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
