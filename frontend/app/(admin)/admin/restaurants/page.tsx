"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { listAllRestaurantsAdmin } from "@/lib/restaurants/api";
import type { RestaurantStatus, RestaurantSummary } from "@/lib/restaurants/types";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  DISABLED: "bg-red-100 text-red-700",
};

export default function AdminRestaurantsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RestaurantStatus | "">("");
  const [restaurants, setRestaurants] = useState<RestaurantSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listAllRestaurantsAdmin(
      { search: search || undefined, status: status || undefined, pageSize: 50 },
      token,
    )
      .then((res) => setRestaurants(res.items))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Couldn't load restaurants.");
      });
  }, [token, search, status]);

  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp text-2xl font-extrabold text-ink">All restaurants</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="min-w-[220px] rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RestaurantStatus | "")}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {restaurants === null ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : restaurants.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No restaurants match.</p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
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
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  STATUS_STYLE[restaurant.status ?? "ACTIVE"]
                }`}
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
