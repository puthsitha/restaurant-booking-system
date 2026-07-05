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
import { listAllReservationsAdmin } from "@/lib/reservations/api";
import { RESERVATION_STATUS_OPTIONS, RESERVATION_STATUS_TONE } from "@/lib/reservations/statusTone";
import type { ListReservationsResponse, Reservation, ReservationStatus } from "@/lib/reservations/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export default function AdminBookingsPage() {
  const { token } = useAdminAuth();
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
        setError(err instanceof ApiError ? err.message : "Couldn't load bookings.");
      });
  }, [token, statusFilter, dateFilter, debouncedSearch, page]);

  useEffect(load, [load]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-muted">
        Platform-wide oversight, read-only — owners manage their own bookings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by restaurant, customer, or phone"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All statuses" },
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
        <EmptyState className="mt-8" icon={CalendarIcon} title="No bookings match those filters" />
      ) : (
        <>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
            {result.items.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDetailTarget(r)}
                className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-bg"
              >
                <div>
                  <p className="font-bold text-ink">
                    {r.user.name} · {r.partySize} guests
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {r.restaurant.name} · {r.date.slice(0, 10)} at {r.time}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {r.user.phone ?? r.user.email ?? ""} · {r.confirmationCode}
                  </p>
                </div>
                <StatusBadge tone={RESERVATION_STATUS_TONE[r.status]}>{r.status}</StatusBadge>
              </button>
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

      <BookingDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} />
    </main>
  );
}
