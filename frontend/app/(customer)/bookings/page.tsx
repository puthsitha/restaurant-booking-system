"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { cancelMyReservation, listMyReservations } from "@/lib/reservations/api";
import type { Reservation, ReservationStatus } from "@/lib/reservations/types";

const STATUS_STYLE: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-secondary/10 text-secondary",
  SEATED: "bg-secondary/10 text-secondary",
  COMPLETED: "bg-bg text-muted",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
};

const CANCELLABLE: ReservationStatus[] = ["PENDING", "CONFIRMED"];

export default function MyBookingsPage() {
  const { token, status: authStatus } = useCustomerAuth();
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyReservations(token)
      .then((res) => setReservations(res.reservations))
      .catch(() => setError("Couldn't load your bookings."));
  }, [token]);

  useEffect(load, [load]);

  async function handleCancel(): Promise<void> {
    if (!toCancel || !token) return;
    setCancelling(true);
    try {
      await cancelMyReservation(toCancel.id, token);
      setToCancel(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't cancel this booking.");
    } finally {
      setCancelling(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 32px" }}>
        <ListSkeleton rows={3} />
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 32px" }}>
        <EmptyState
          icon={CalendarIcon}
          title="Sign in to see your bookings"
          message="Log in from the header to view and manage your reservations."
        />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 32px" }}>
      <h1 className="disp text-2xl font-extrabold text-ink">My bookings</h1>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : reservations === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={CalendarIcon}
          title="No bookings yet"
          message="Find a restaurant you love and reserve a table — it only takes a minute."
          actionLabel="Browse restaurants"
          actionHref="/search"
        />
      ) : (
        <div className="mt-8 space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">{r.restaurant.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {r.date.slice(0, 10)} at {r.time} · {r.partySize} guests
                  </p>
                  <p className="mt-1 text-xs text-muted">Confirmation {r.confirmationCode}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[r.status]}`}
                >
                  {r.status}
                </span>
              </div>
              {CANCELLABLE.includes(r.status) && (
                <button
                  type="button"
                  onClick={() => setToCancel(r)}
                  className="mt-3 rounded-lg border border-border px-4 py-2 text-xs font-bold text-ink transition hover:bg-bg"
                >
                  Cancel booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={toCancel !== null} onClose={() => setToCancel(null)} title="Cancel this booking?">
        {toCancel && (
          <div>
            <p className="text-sm text-ink">
              {toCancel.restaurant.name} on {toCancel.date.slice(0, 10)} at {toCancel.time} for{" "}
              {toCancel.partySize} guests.
            </p>
            <p className="mt-2 text-sm text-muted">This can&apos;t be undone.</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setToCancel(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
