import Link from "next/link";

import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { ChefHatIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { listRestaurants } from "@/lib/restaurants/api";

export default async function HomePage() {
  const { items } = await listRestaurants({ pageSize: 8 }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 8,
  }));

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
      <p
        className="km"
        style={{
          color: "var(--muted)",
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          fontSize: 12
        }}
      >
        TableSite · Cambodia
      </p>
      <h1
        className="disp"
        style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em", marginTop: 8 }}
      >
        Table<span style={{ color: "var(--accent)" }}>Site</span> — find your table
      </h1>
      <p style={{ marginTop: 12, color: "#4A4039", maxWidth: 560, lineHeight: 1.6 }}>
        Reserve Cambodia&apos;s best tables — bilingual, dual-currency, KHQR-ready.
      </p>

      <form action="/search" className="mt-8 flex max-w-xl gap-2">
        <input
          name="search"
          placeholder="Search by restaurant name..."
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white"
        >
          Search
        </button>
      </form>

      <div className="mt-14 flex items-center justify-between">
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
    </main>
  );
}
