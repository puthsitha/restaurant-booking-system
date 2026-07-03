import Link from "next/link";

import { HomeHero } from "@/components/home/HomeHero";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { ChefHatIcon } from "@/components/ui/icons";
import { listRestaurants } from "@/lib/restaurants/api";

const CUISINE_TILES = [
  { label: "Khmer", icon: "🍚", cuisine: "Khmer" },
  { label: "Seafood", icon: "🦐", cuisine: "Seafood" },
  { label: "BBQ & Grill", icon: "🔥", cuisine: "BBQ" },
  { label: "Fine dining", icon: "🍽️", cuisine: undefined },
  { label: "Café", icon: "☕", cuisine: "Café" },
  { label: "Street food", icon: "🍢", cuisine: "Street food" },
];

export default async function HomePage() {
  const { items } = await listRestaurants({ pageSize: 8 }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 8,
  }));

  return (
    <main>
      <HomeHero />

      <div className="mx-auto max-w-[1280px] px-8 py-14">
        {/* Cuisine tiles */}
        <FadeIn delay={0.05}>
          <h2 className="disp text-xl font-bold text-ink">Browse by cuisine</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CUISINE_TILES.map((tile) => (
              <Link
                key={tile.label}
                href={`/search${tile.cuisine ? `?cuisineType=${encodeURIComponent(tile.cuisine)}` : ""}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center transition hover:-translate-y-1 hover:border-[#E2B8A6] hover:shadow-[0_12px_24px_rgba(194,65,12,.12)]"
              >
                <span className="text-2xl">{tile.icon}</span>
                <span className="text-sm font-bold text-ink">{tile.label}</span>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* Featured restaurants */}
        <FadeIn delay={0.1} className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="disp text-xl font-bold text-ink">Popular restaurants</h2>
            <Link href="/search" className="text-sm font-semibold text-accent">
              View all →
            </Link>
          </div>

          {items.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={ChefHatIcon}
              title="The dining room is warming up"
              message="No restaurants have opened their doors yet — check back soon for new spots."
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
        <FadeIn delay={0.15} className="mt-14">
          <div
            className="flex flex-col items-start justify-between gap-4 rounded-2xl px-8 py-8 text-white sm:flex-row sm:items-center"
            style={{ background: "linear-gradient(120deg, #1F6F54, #15503C)" }}
          >
            <div>
              <h3 className="disp text-xl font-extrabold">Own a restaurant?</h3>
              <p className="mt-1.5 max-w-md text-sm text-white/85">
                List your restaurant on TableSite and manage bookings, tables, and menus from one
                dashboard.
              </p>
            </div>
            <Link
              href="/owner/login"
              className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-secondary"
            >
              Open owner portal
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
