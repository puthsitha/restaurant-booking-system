"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listMyRestaurants } from "@/lib/restaurants/api";
import type { RestaurantOwned } from "@/lib/restaurants/types";
import { useAuth } from "@/lib/auth/AuthContext";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  DISABLED: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return (
      <main style={{ padding: 32 }}>
        <h1 className="disp text-2xl font-extrabold text-ink">Platform admin</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Moderate restaurants and manage the platform-wide tag list.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/restaurants"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
          >
            All restaurants
          </Link>
          <Link
            href="/admin/tags"
            className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink"
          >
            Manage tags
          </Link>
        </div>
      </main>
    );
  }

  return <OwnerDashboard />;
}

function OwnerDashboard() {
  const { user, token } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantOwned[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listMyRestaurants(token)
      .then((res) => setRestaurants(res.restaurants))
      .catch(() => setError("Couldn't load your restaurants."));
  }, [token]);

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
          href="/admin/restaurants/new"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          + New restaurant
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {restaurants === null ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : restaurants.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          You haven&apos;t added a restaurant yet.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/admin/restaurants/${restaurant.id}`}
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
