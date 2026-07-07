import { useEffect, useState } from "react";

export interface ClientLocation {
  lat: number;
  lng: number;
}

// Same fallback the backend uses when no coordinates are sent at all (see
// backend/src/lib/geo.ts) — kept here too so a denied/unavailable permission
// still shows a (Phnom-Penh-relative) distance instead of nothing.
const PHNOM_PENH: ClientLocation = { lat: 11.5564, lng: 104.9282 };

// Requests the browser's geolocation once on mount so restaurant search
// results can show a real distance. Falls back to Phnom Penh immediately if
// the API is unavailable, permission is denied, or the request times out —
// callers never have to branch on "no location yet".
export function useClientLocation(): ClientLocation {
  const [location, setLocation] = useState<ClientLocation>(PHNOM_PENH);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setLocation(PHNOM_PENH),
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return location;
}
