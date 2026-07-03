"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeletons";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { listAllReservationsAdmin } from "@/lib/reservations/api";
import type { Reservation, ReservationStatus } from "@/lib/reservations/types";

const STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const STATUS_STYLE: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-secondary/10 text-secondary",
  SEATED: "bg-secondary/10 text-secondary",
  COMPLETED: "bg-bg text-muted",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
};

export default function AdminBookingsPage() {
  const { token } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listAllReservationsAdmin(
      { status: statusFilter || undefined, date: dateFilter || undefined, pageSize: 50 },
      token,
    )
      .then((res) => setReservations(res.items))
      .catch(() => setError("Couldn't load bookings."));
  }, [token, statusFilter, dateFilter]);

  useEffect(load, [load]);

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-muted">
        Platform-wide oversight, read-only — owners manage their own bookings.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "")}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : reservations === null ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState className="mt-8" icon={CalendarIcon} title="No bookings match those filters" />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
          {reservations.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-bold text-ink">
                  {r.user.name} · {r.partySize} guests
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {r.restaurant.name} · {r.date.slice(0, 10)} at {r.time}
                </p>
                <p className="mt-0.5 text-xs text-muted">{r.confirmationCode}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[r.status]}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
