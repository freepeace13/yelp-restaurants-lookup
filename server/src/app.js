import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { createHealthRouter } from "./routes/health.js";
import { createRestaurantsRouter } from "./routes/restaurants.js";

/**
 * Application factory — composes middleware and routes. Use in tests without listening.
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  app.use(createHealthRouter());
  app.use(createRestaurantsRouter());

  app.use(errorHandler);

  return app;
}
