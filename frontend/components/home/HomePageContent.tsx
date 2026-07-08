"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { ChefHatIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";
import { listCuisines, listRestaurants } from "@/lib/restaurants/api";
import type { Cuisine, RestaurantSummary } from "@/lib/restaurants/types";

interface HomePageContentProps {
  items: RestaurantSummary[];
}

export function HomePageContent({ items: initialItems }: HomePageContentProps) {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  // Server-rendered with the UI shell's default locale (see the page
  // component) — re-fetch on the client once the real locale is known, and
  // again on every toggle, so restaurant names/descriptions/tags follow it
  // too, not just the surrounding chrome strings.
  useEffect(() => {
    listRestaurants({ pageSize: 8 }, locale)
      .then((res) => setItems(res.items))
      .catch(() => {});
  }, [locale]);

  // Fetched without a locale so `cuisine.name` stays the canonical English
  // value the search filter matches on — the Khmer label (when shown) comes
  // from `nameKm` client-side instead of a locale-swapped `name`.
  useEffect(() => {
    listCuisines()
      .then((res) => setCuisines(res.cuisines))
      .catch(() => setCuisines([]));
  }, []);

  return (
    <div className="mx-auto max-w-[1280px] px-8 py-14">
      {/* Cuisine tiles */}
      <FadeIn delay={0.05}>
        <h2 className="disp text-xl font-bold text-ink">
          {t("home.browseByCuisine")}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cuisines.map((cuisine) => (
            <Link
              key={cuisine.id}
              href={`/search?cuisineType=${encodeURIComponent(cuisine.name)}`}
              className="km flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center transition hover:-translate-y-1 hover:border-[#E2B8A6] hover:shadow-[0_12px_24px_rgba(194,65,12,.12)]"
            >
              {cuisine.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cuisine.imageUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
              <span className="text-sm font-bold text-ink">
                {locale === "km"
                  ? cuisine.nameKm || cuisine.name
                  : cuisine.name}
              </span>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* Featured restaurants */}
      <FadeIn delay={0.1} className="mt-14">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="disp text-xl font-bold text-ink">
              {t("home.popularRestaurants")}
            </h2>
            <p className="km mt-1 text-sm text-muted">
              {t("home.popularRestaurantsSubtitle")}
            </p>
          </div>
          <Link
            href="/search"
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink"
          >
            {t("home.viewAll")}
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={ChefHatIcon}
            title={t("home.emptyTitle")}
            message={t("home.emptyMessage")}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </FadeIn>

      {/* Owner CTA */}
      {/* <FadeIn delay={0.15} className="mt-14">
        <div
          className="flex flex-col items-start justify-between gap-4 rounded-2xl px-8 py-8 text-white sm:flex-row sm:items-center"
          style={{ background: "linear-gradient(120deg, #1F6F54, #15503C)" }}
        >
          <div>
            <h3 className="disp text-xl font-extrabold">{t("home.ownerCtaTitle")}</h3>
            <p className="mt-1.5 max-w-md text-sm text-white/85">{t("home.ownerCtaBody")}</p>
          </div>
          <Link
            href="/owner/login"
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-secondary"
          >
            {t("home.ownerCtaButton")}
          </Link>
        </div>
      </FadeIn> */}
    </div>
  );
}
