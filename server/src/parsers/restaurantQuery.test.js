import assert from "node:assert";
import { test } from "node:test";
import { parseRestaurantQuery } from "./restaurantQuery.js";

test("parseRestaurantQuery: missing city", () => {
  const r = parseRestaurantQuery({ query: {} });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.error, "City is required");
});

test("parseRestaurantQuery: city and optional params", () => {
  const r = parseRestaurantQuery({
    query: {
      city: "Austin",
      strictFiltering: "true",
      radiusMeters: "5000",
      latitude: "30.27",
      longitude: "-97.74",
    },
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.city, "Austin");
    assert.equal(r.value.strictFiltering, true);
    assert.equal(r.value.radiusMeters, 5000);
    assert.equal(r.value.latitude, 30.27);
    assert.equal(r.value.longitude, -97.74);
  }
});

test("parseRestaurantQuery: invalid radius", () => {
  const r = parseRestaurantQuery({
    query: { city: "X", radiusMeters: "999999" },
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.error.includes("radiusMeters"));
});
