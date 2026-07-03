"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cancelMyReservation, listMyReservations } from "@/lib/reservations/api";
import type { Reservation, ReservationStatus } from "@/lib/reservations/types";

const STATUS_TONE: Record<ReservationStatus, StatusTone> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SEATED: "seated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "noShow",
};

const CANCELLABLE: ReservationStatus[] = ["PENDING", "CONFIRMED"];
const PAST_STATUSES: ReservationStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];

export default function MyBookingsPage() {
  const { token, status: authStatus } = useCustomerAuth();
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyReservations(token)
      .then((res) => setReservations(res.reservations))
      .catch(() => setError("Couldn't load your bookings."));
  }, [token]);

  useEffect(load, [load]);

  const visible = useMemo(() => {
    if (!reservations) return null;
    const isPast = (r: Reservation) => PAST_STATUSES.includes(r.status);
    return reservations.filter((r) => (tab === "past" ? isPast(r) : !isPast(r)));
  }, [reservations, tab]);

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
      <main className="mx-auto max-w-[720px] px-8 py-12">
        <ListSkeleton rows={3} />
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <main className="mx-auto max-w-[720px] px-8 py-12">
        <EmptyState
          icon={CalendarIcon}
          title="Sign in to see your bookings"
          message="Log in from the header to view and manage your reservations."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[720px] px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="disp text-2xl font-extrabold text-ink">My bookings</h1>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
          ]}
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : visible === null ? (
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={CalendarIcon}
          title={tab === "past" ? "No past bookings" : "No upcoming bookings"}
          message="Find a restaurant you love and reserve a table — it only takes a minute."
          actionLabel="Browse restaurants"
          actionHref="/search"
        />
      ) : (
        <motion.div
          className="mt-8 space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {visible.map((r) => (
            <motion.div
              key={r.id}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">{r.restaurant.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {r.date.slice(0, 10)} at {r.time} · {r.partySize} guests
                  </p>
                  <p className="mt-1 text-xs text-muted">Confirmation {r.confirmationCode}</p>
                </div>
                <StatusBadge tone={STATUS_TONE[r.status]} className="shrink-0">
                  {r.status}
                </StatusBadge>
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
            </motion.div>
          ))}
        </motion.div>
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
