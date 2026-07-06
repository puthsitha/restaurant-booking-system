"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ChefHatIcon, SearchOffIcon } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { listMyRestaurants } from "@/lib/restaurants/api";
import type { ListRestaurantsResponse, RestaurantStatus } from "@/lib/restaurants/types";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { useLanguage } from "@/lib/i18n/context";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const STATUS_TONE: Record<RestaurantStatus, StatusTone> = {
  PENDING: "pending",
  ACTIVE: "success",
  DISABLED: "danger",
};

export default function OwnerRestaurantsPage() {
  const { user, token } = useOwnerAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<RestaurantStatus | "">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListRestaurantsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Unfiltered count, independent of the search/status filters above, so the
  // "reached your limit" check stays correct while a filter narrows the list.
  const [totalOwned, setTotalOwned] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyRestaurants(
      { search: debouncedSearch || undefined, status: status || undefined, page, pageSize: 12 },
      token,
    )
      .then((res) => setResult(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
      });
  }, [token, debouncedSearch, status, page, t]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!token) return;
    listMyRestaurants({ pageSize: 1 }, token)
      .then((res) => setTotalOwned(res.total))
      .catch(() => undefined);
  }, [token]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const atLimit = Boolean(
    user && totalOwned !== null && user.restaurantLimit > 0 && totalOwned >= user.restaurantLimit,
  );

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{t("ownerRestaurants.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("ownerRestaurants.allowedCount", { count: user?.restaurantLimit ?? 0 })}
          </p>
        </div>
        {atLimit ? (
          <div className="max-w-[260px] rounded-xl border border-border bg-surface px-4 py-3 text-right text-xs text-muted">
            {t("ownerRestaurants.limitReached")}
          </div>
        ) : (
          <Link
            href="/owner/restaurants/new"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
          >
            {t("ownerRestaurants.newRestaurant")}
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("ownerRestaurants.searchByName")}
          className="min-w-[220px] rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: t("ownerRestaurants.anyStatus") },
            { value: "PENDING", label: t("ownerRestaurants.pendingReview") },
            { value: "ACTIVE", label: t("ownerRestaurants.active") },
            { value: "DISABLED", label: t("ownerRestaurants.disabled") }
          ]}
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : result === null ? (
        <div className="mt-8">
          <ListSkeleton rows={2} />
        </div>
      ) : result.items.length === 0 && !debouncedSearch && !status ? (
        <EmptyState
          className="mt-8"
          icon={ChefHatIcon}
          title={t("ownerRestaurants.emptyFirstTitle")}
          message={t("ownerRestaurants.emptyFirstMessage")}
          actionLabel={t("ownerRestaurants.newRestaurant")}
          actionHref="/owner/restaurants/new"
        />
      ) : result.items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={SearchOffIcon}
          title={t("ownerRestaurants.emptyFilteredTitle")}
          actionLabel={t("common.clearFilters")}
          onAction={() => {
            setSearch("");
            setStatus("");
          }}
        />
      ) : (
        <>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
            {result.items.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/owner/restaurants/${restaurant.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg"
              >
                <div className="min-w-0">
                  <p className="font-bold text-ink">{restaurant.name}</p>
                  <p className="text-sm text-muted">
                    {restaurant.cuisineType} · {restaurant.city}
                  </p>
                  {restaurant.statusReason && (
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-semibold">{t("common.reasonPrefix")}</span>
                      {restaurant.statusReason}
                    </p>
                  )}
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
                {t("common.previous")}
              </button>
              <span className="text-sm text-muted">{t("common.pageOf", { page, total: totalPages })}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
