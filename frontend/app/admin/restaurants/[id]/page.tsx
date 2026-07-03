"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { getRestaurant, updateRestaurantStatus } from "@/lib/restaurants/api";
import type { RestaurantManagementDetail } from "@/lib/restaurants/types";

// Moderation view: admins can inspect a restaurant and enable/disable it,
// but editing profile/hours/menu/etc. stays owner-only by design.
export default function AdminRestaurantDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAdminAuth();
  const [restaurant, setRestaurant] = useState<RestaurantManagementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const res = await getRestaurant(params.id, token);
      setRestaurant(res.restaurant);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this restaurant.");
    }
  }, [params.id, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleToggleStatus(): Promise<void> {
    if (!token || !restaurant) return;
    const nextStatus = restaurant.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      await updateRestaurantStatus(restaurant.id, nextStatus, token);
      setRestaurant({ ...restaurant, status: nextStatus });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update status");
    }
  }

  if (error) {
    return (
      <main className="p-8">
        <ErrorState message={error} onRetry={reload} />
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="p-8">
        <LoadingSpinner label="Pulling up the file…" size="lg" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[720px] p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{restaurant.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {restaurant.cuisineType} · {restaurant.address}, {restaurant.city}
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">Current status</p>
        <p className="mt-1 text-lg font-bold text-ink">{restaurant.status}</p>
        <button
          onClick={handleToggleStatus}
          className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
        >
          {restaurant.status === "ACTIVE" ? "Disable restaurant" : "Enable restaurant"}
        </button>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Owner</dt>
          <dd className="text-ink">{restaurant.ownerId}</dd>
        </div>
        <div>
          <dt className="text-muted">Menus</dt>
          <dd className="text-ink">{restaurant.menus.length}</dd>
        </div>
        <div>
          <dt className="text-muted">Tables</dt>
          <dd className="text-ink">{restaurant.tables.length}</dd>
        </div>
        <div>
          <dt className="text-muted">Tags</dt>
          <dd className="text-ink">{restaurant.tags.map((t) => t.name).join(", ") || "—"}</dd>
        </div>
      </dl>
    </main>
  );
}
