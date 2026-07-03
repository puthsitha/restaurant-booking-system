"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { HeartIcon } from "@/components/ui/icons";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import type { RestaurantSummary } from "@/lib/restaurants/types";
import { useSavedRestaurants } from "@/lib/savedRestaurants/context";

const PRICE_LABEL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" };

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  const { status } = useCustomerAuth();
  const { savedIds, toggle } = useSavedRestaurants();
  const isSaved = savedIds.has(restaurant.id);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-[0_18px_38px_rgba(0,0,0,.12)]"
      >
        <div className="relative h-40 w-full bg-bg">
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
          {status === "authenticated" && (
            <button
              type="button"
              aria-label={isSaved ? "Remove from saved restaurants" : "Save restaurant"}
              aria-pressed={isSaved}
              onClick={(e) => {
                e.preventDefault();
                toggle(restaurant.id);
              }}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-accent backdrop-blur transition hover:bg-white"
            >
              <HeartIcon className="h-4 w-4" filled={isSaved} />
            </button>
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
    </motion.div>
  );
}
