"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ChefHatIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { listMyRestaurants } from "@/lib/restaurants/api";
import type { RestaurantOwned } from "@/lib/restaurants/types";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  DISABLED: "bg-red-100 text-red-700",
};

export default function OwnerRestaurantsPage() {
  const { user, token } = useOwnerAuth();
  const [restaurants, setRestaurants] = useState<RestaurantOwned[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyRestaurants(token)
      .then((res) => setRestaurants(res.restaurants))
      .catch(() => setError("Couldn't load your restaurants."));
  }, [token]);

  useEffect(load, [load]);

  return (
    <main style={{ padding: 32 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">My restaurants</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.restaurantLimit ?? 0} restaurant{(user?.restaurantLimit ?? 0) === 1 ? "" : "s"}{" "}
            allowed on your account.
          </p>
        </div>
        <Link
          href="/owner/restaurants/new"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          + New restaurant
        </Link>
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : restaurants === null ? (
        <div className="mt-8">
          <ListSkeleton rows={2} />
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={ChefHatIcon}
          title="Your first restaurant awaits"
          message="Add your restaurant's profile, hours, and menu — diners are searching for a table right now."
          actionLabel="+ New restaurant"
          actionHref="/owner/restaurants/new"
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/owner/restaurants/${restaurant.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-bg"
            >
              <div>
                <p className="font-bold text-ink">{restaurant.name}</p>
                <p className="text-sm text-muted">
                  {restaurant.cuisineType} · {restaurant.city}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[restaurant.status]}`}
              >
                {restaurant.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
