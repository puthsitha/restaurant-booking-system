import { describe, expect, it } from "vitest";

import { getClientCoordinates, haversineDistanceKm, PHNOM_PENH_COORDINATES } from "./geo";
import type { Request } from "express";

function reqWithHeaders(headers: Record<string, string>): Request {
  return { headers } as unknown as Request;
}

describe("haversineDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineDistanceKm(PHNOM_PENH_COORDINATES, PHNOM_PENH_COORDINATES)).toBeCloseTo(0, 5);
  });

  it("returns a plausible distance between Phnom Penh and Siem Reap", () => {
    const siemReap = { latitude: 13.3671, longitude: 103.8448 };
    const distance = haversineDistanceKm(PHNOM_PENH_COORDINATES, siemReap);
    expect(distance).toBeGreaterThan(230);
    expect(distance).toBeLessThan(280);
  });
});

describe("getClientCoordinates", () => {
  it("reads valid lat/lng headers", () => {
    const req = reqWithHeaders({ "x-client-lat": "13.3671", "x-client-lng": "103.8448" });
    expect(getClientCoordinates(req)).toEqual({ latitude: 13.3671, longitude: 103.8448 });
  });

  it("falls back to Phnom Penh when headers are missing", () => {
    expect(getClientCoordinates(reqWithHeaders({}))).toEqual(PHNOM_PENH_COORDINATES);
  });

  it("falls back to Phnom Penh when headers are malformed", () => {
    const req = reqWithHeaders({ "x-client-lat": "not-a-number", "x-client-lng": "103.8448" });
    expect(getClientCoordinates(req)).toEqual(PHNOM_PENH_COORDINATES);
  });

  it("falls back to Phnom Penh when coordinates are out of range", () => {
    const req = reqWithHeaders({ "x-client-lat": "999", "x-client-lng": "103.8448" });
    expect(getClientCoordinates(req)).toEqual(PHNOM_PENH_COORDINATES);
  });
});
