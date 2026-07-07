"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { FavoriteButton } from "@/components/restaurants/FavoriteButton";
import { PinIcon, StarIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import type { RestaurantSummary } from "@/lib/restaurants/types";

const PRICE_LABEL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" };

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  const { t } = useLanguage();

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
          {restaurant.isPopular && (
            <span className="km absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
              <StarIcon className="h-3 w-3" />
              {t("restaurantCard.popular")}
            </span>
          )}
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton restaurantId={restaurant.id} size="sm" />
          </div>
          {restaurant.avgRating != null && (
            <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
              <StarIcon className="h-3 w-3" />
              {restaurant.avgRating.toFixed(1)}
            </span>
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
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            {restaurant.distanceKm != null ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-muted">
                <PinIcon className="h-3.5 w-3.5" />
                {t("restaurantCard.distanceKm", { km: restaurant.distanceKm })}
              </span>
            ) : (
              <span />
            )}
            {restaurant.depositRequired ? (
              <span className="km rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                {t("restaurantCard.depositFrom", { amount: `$${Number(restaurant.depositAmount).toFixed(2)}` })}
              </span>
            ) : (
              <span className="km rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                {t("restaurantCard.noDepositNeeded")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
