"use client";

import Link from "next/link";

import { PinIcon, StarIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import { PRICE_SYMBOL } from "@/lib/restaurants/priceLabels";
import type { RestaurantSummary } from "@/lib/restaurants/types";

interface RestaurantMapViewProps {
  restaurants: RestaurantSummary[];
}

interface Positioned {
  restaurant: RestaurantSummary;
  top: number;
  left: number;
}

// A stylized (not geographically real) grid map — there's no map library in
// this project, so pins are placed by normalizing each restaurant's lat/lng
// into a percentage box rather than pulling in Leaflet/Mapbox for what the
// reference design treats as a decorative overview, not a pannable map.
function layoutPins(restaurants: RestaurantSummary[]): Positioned[] {
  const withCoords = restaurants.filter(
    (r): r is RestaurantSummary & { latitude: string; longitude: string } =>
      r.latitude != null && r.longitude != null,
  );
  if (withCoords.length === 0) return [];

  const lats = withCoords.map((r) => Number(r.latitude));
  const lngs = withCoords.map((r) => Number(r.longitude));
  const latSpan = Math.max(...lats) - Math.min(...lats) || 1;
  const lngSpan = Math.max(...lngs) - Math.min(...lngs) || 1;
  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);

  return withCoords.map((restaurant) => {
    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);
    return {
      restaurant,
      // Higher latitude (further north) sits nearer the top of the box.
      top: 12 + (1 - (lat - minLat) / latSpan) * 72,
      left: 12 + ((lng - minLng) / lngSpan) * 72,
    };
  });
}

function dominantCity(restaurants: RestaurantSummary[]): string | null {
  const counts = new Map<string, number>();
  for (const r of restaurants) {
    counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [city, count] of counts) {
    if (count > bestCount) {
      best = city;
      bestCount = count;
    }
  }
  return best;
}

export function RestaurantMapView({ restaurants }: RestaurantMapViewProps) {
  const { t } = useLanguage();
  const pins = layoutPins(restaurants);
  const city = dominantCity(restaurants);

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <div
        className="relative h-[420px] flex-1 overflow-hidden rounded-2xl border border-border bg-bg sm:h-[520px]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(120,120,120,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        {pins.map(({ restaurant, top, left }) => (
          <Link
            key={restaurant.id}
            href={`/restaurants/${restaurant.slug}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(194,65,12,.35)] transition hover:-translate-y-[calc(50%+2px)]"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            {PRICE_SYMBOL[restaurant.priceRange]} {restaurant.name}
          </Link>
        ))}
        {city && (
          <span className="km absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow backdrop-blur">
            <PinIcon className="h-3.5 w-3.5" />
            {t("searchPage.mapCaption", { city })}
          </span>
        )}
      </div>

      <div className="flex max-h-[420px] w-full flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[520px] lg:w-80 lg:shrink-0">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/restaurants/${restaurant.slug}`}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-3 transition hover:border-[#E2B8A6]"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg">
              {restaurant.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={restaurant.coverImageUrl}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xl">🍽️</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{restaurant.name}</p>
              <p className="truncate text-xs text-muted">{restaurant.cuisineType}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                {restaurant.avgRating != null && (
                  <span className="flex items-center gap-0.5 text-accent">
                    <StarIcon className="h-3 w-3" />
                    {restaurant.avgRating.toFixed(1)}
                  </span>
                )}
                <span>{PRICE_SYMBOL[restaurant.priceRange]}</span>
                {restaurant.distanceKm != null && (
                  <span className="text-muted">· {restaurant.distanceKm} km</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
