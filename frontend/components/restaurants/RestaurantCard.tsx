import Link from "next/link";

import type { RestaurantSummary } from "@/lib/restaurants/types";

const PRICE_LABEL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" };

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="block overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg"
    >
      <div className="h-40 w-full bg-bg">
        {restaurant.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="disp font-bold text-ink">{restaurant.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-muted">
            {PRICE_LABEL[restaurant.priceRange]}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {restaurant.cuisineType} · {restaurant.city}
        </p>
        {restaurant.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-ink"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
