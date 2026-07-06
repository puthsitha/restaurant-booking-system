"use client";

import { useCallback, useEffect, useState } from "react";

import { BookingDetailModal } from "@/components/reservations/BookingDetailModal";
import { DateField } from "@/components/ui/DateField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarIcon } from "@/components/ui/icons";
import { SearchField } from "@/components/ui/SearchField";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { formatRelativeDate, formatTimeLabel, parseIsoDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import { listAllReservationsAdmin } from "@/lib/reservations/api";
import { RESERVATION_STATUS_OPTIONS, RESERVATION_STATUS_TONE } from "@/lib/reservations/statusTone";
import type { ListReservationsResponse, Reservation, ReservationStatus } from "@/lib/reservations/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export default function AdminBookingsPage() {
  const { token } = useAdminAuth();
  const { locale, t } = useLanguage();
  const [result, setResult] = useState<ListReservationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, dateFilter]);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listAllReservationsAdmin(
      {
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize: 12,
      },
      token,
    )
      .then((res) => setResult(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t("adminBookings.loadError"));
      });
  }, [token, statusFilter, dateFilter, debouncedSearch, page, t]);

  useEffect(load, [load]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">{t("adminBookings.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("adminBookings.subtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("adminBookings.searchPlaceholder")}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: t("adminBookings.allStatuses") },
            ...RESERVATION_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))
          ]}
        />
        <DateField value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : result === null ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState className="mt-8" icon={CalendarIcon} title={t("adminBookings.emptyTitle")} />
      ) : (
        <>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
            {result.items.map((r) => {
              const parsedDate = parseIsoDate(r.date.slice(0, 10));
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDetailTarget(r)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-bg"
                >
                  <div>
                    <p className="font-bold text-ink">
                      {r.user.name} · {t("bookingWidget.guestsCount", { count: r.partySize })}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {r.restaurant.name} ·{" "}
                      {parsedDate ? formatRelativeDate(parsedDate, locale, t) : r.date.slice(0, 10)}{" "}
                      {t("bookingsPage.at")} {formatTimeLabel(r.time, locale, t)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.user.phone ?? r.user.email ?? ""} · {r.confirmationCode}
                    </p>
                  </div>
                  <StatusBadge tone={RESERVATION_STATUS_TONE[r.status]}>{r.status}</StatusBadge>
                </button>
              );
            })}
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

      <BookingDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} />
    </main>
  );
}
