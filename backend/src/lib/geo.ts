import type { Request } from "express";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Used whenever the client didn't share (or declined to share) their
// location — keeps distance figures meaningful for the Cambodia-only
// audience this app serves instead of omitting them entirely.
export const PHNOM_PENH_COORDINATES: Coordinates = { latitude: 11.5564, longitude: 104.9282 };

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Great-circle distance between two lat/lng points, in kilometers.
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Diner clients send their browser-geolocation coordinates as plain headers
// (see frontend's apiFetch) so search results can show a distance — falls
// back to Phnom Penh when the headers are missing or malformed (no location
// permission granted, or a server-side request with no browser involved).
export function getClientCoordinates(req: Request): Coordinates {
  const lat = Number(req.headers["x-client-lat"]);
  const lng = Number(req.headers["x-client-lng"]);
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { latitude: lat, longitude: lng };
  }
  return PHNOM_PENH_COORDINATES;
}
