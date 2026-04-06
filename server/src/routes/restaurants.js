import { Router } from "express";
import { listCityRestaurants } from "../services/RestaurantLookup.js";
import { HttpError } from "../errors/HttpError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { parseRestaurantQuery } from "../parsers/restaurantQuery.js";

export function createRestaurantsRouter() {
  const router = Router();

  router.get(
    "/api/restaurants",
    asyncHandler(async (req, res) => {
      const parsed = parseRestaurantQuery(req);
      if (!parsed.ok) {
        throw new HttpError(400, parsed.error);
      }
      const { city, ...options } = parsed.value;
      const restaurants = await listCityRestaurants(city, options);
      res.json(restaurants);
    }),
  );

  return router;
}
