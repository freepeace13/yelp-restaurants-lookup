import assert from "node:assert/strict";
import test from "node:test";
import {
  EARTH_MEAN_RADIUS_METERS,
  FIVE_MILES_METERS,
  buildLocationRelevance,
  haversineDistanceMeters,
  metersToMiles,
  toRadians,
} from "./geoDistance.js";

test("toRadians: 180° = π", () => {
  assert.ok(Math.abs(toRadians(180) - Math.PI) < 1e-12);
});

/**
 * Along a meridian, arc length for Δlat = R * Δφ (φ in radians).
 * 1° latitude ≈ (π/180) * R meters.
 */
test("haversine: 1° latitude along meridian matches spherical arc length", () => {
  const expected = (Math.PI / 180) * EARTH_MEAN_RADIUS_METERS;
  const d = haversineDistanceMeters(0, 0, 1, 0);
  assert.ok(Math.abs(d - expected) < 0.5, `got ${d}, expected ~${expected}`);
});

test("haversine: same point is 0 m", () => {
  assert.equal(haversineDistanceMeters(40.7, -74, 40.7, -74), 0);
});

/**
 * One minute of latitude ≈ 1 nautical mile ≈ 1852 m (definition),
 * so distance from (0,0) to (1/60, 0) should be ~1852 m.
 */
test("haversine: 1 minute of latitude ≈ 1 nautical mile", () => {
  const d = haversineDistanceMeters(0, 0, 1 / 60, 0);
  const oneNauticalMileMeters = 1852;
  assert.ok(
    Math.abs(d - oneNauticalMileMeters) < 2,
    `got ${d} m, expected ~${oneNauticalMileMeters} m`,
  );
});

test("metersToMiles: 1609.344 m = 1 statute mile", () => {
  assert.ok(Math.abs(metersToMiles(1609.344) - 1) < 1e-9);
});

test("FIVE_MILES_METERS is 5 × 1609.344 m rounded", () => {
  assert.equal(FIVE_MILES_METERS, Math.round(5 * 1609.344));
});

test("buildLocationRelevance: missing coords → not assessed", () => {
  const r = buildLocationRelevance(null, -74, { latitude: 40, longitude: -74 });
  assert.equal(r.assessed, false);
  assert.equal(r.withinSearchRadius, null);
});

test("buildLocationRelevance: point at center → within radius, ~0 mi", () => {
  const r = buildLocationRelevance(40, -74, { latitude: 40, longitude: -74 });
  assert.equal(r.assessed, true);
  assert.equal(r.withinSearchRadius, true);
  assert.ok(r.distanceMiles != null && r.distanceMiles < 0.001);
});

test("buildLocationRelevance: far point → outside search radius", () => {
  const r = buildLocationRelevance(
    34.05,
    -118.25,
    { latitude: 40.7128, longitude: -74.006 },
    FIVE_MILES_METERS,
  );
  assert.equal(r.assessed, true);
  assert.equal(r.withinSearchRadius, false);
});
