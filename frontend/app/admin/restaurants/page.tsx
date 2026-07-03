"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchOffIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { listAllRestaurantsAdmin } from "@/lib/restaurants/api";
import type { ListRestaurantsResponse, RestaurantStatus } from "@/lib/restaurants/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const STATUS_TONE: Record<RestaurantStatus, StatusTone> = {
  PENDING: "pending",
  ACTIVE: "success",
  DISABLED: "danger",
};

export default function AdminRestaurantsPage() {
  const { token } = useAdminAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<RestaurantStatus | "">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListRestaurantsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listAllRestaurantsAdmin(
      { search: debouncedSearch || undefined, status: status || undefined, page, pageSize: 12 },
      token,
    )
      .then((res) => setResult(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Couldn't load restaurants.");
      });
  }, [token, debouncedSearch, status, page]);

  useEffect(load, [load]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main className="p-8">
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
          <option value="PENDING">Pending review</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : result === null ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={SearchOffIcon}
          title="No restaurants match those filters"
          message="Try clearing the search or status filter to see the full list."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setStatus("");
          }}
        />
      ) : (
        <>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
            {result.items.map((restaurant) => (
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
                <StatusBadge tone={STATUS_TONE[restaurant.status ?? "ACTIVE"]}>
                  {restaurant.status}
                </StatusBadge>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
