"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { CalendarIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import {
  createManualReservation,
  listOwnerReservations,
  updateReservationStatus,
} from "@/lib/reservations/api";
import type { Reservation, ReservationStatus, SeatingPreference } from "@/lib/reservations/types";
import { listMyRestaurants } from "@/lib/restaurants/api";
import type { RestaurantOwned } from "@/lib/restaurants/types";

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

const SEATING_OPTIONS: SeatingPreference[] = ["INDOOR", "GARDEN", "PRIVATE"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function OwnerBookingsPage() {
  const { token } = useOwnerAuth();
  const [restaurants, setRestaurants] = useState<RestaurantOwned[]>([]);
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listOwnerReservations(
      {
        restaurantId: restaurantFilter || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        pageSize: 50,
      },
      token,
    )
      .then((res) => setReservations(res.items))
      .catch(() => setError("Couldn't load bookings."));
  }, [token, restaurantFilter, statusFilter, dateFilter]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!token) return;
    listMyRestaurants(token)
      .then((res) => setRestaurants(res.restaurants))
      .catch(() => undefined);
  }, [token]);

  async function handleStatusChange(id: string, status: ReservationStatus): Promise<void> {
    if (!token) return;
    try {
      await updateReservationStatus(id, status, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update this booking.");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">Bookings</h1>
          <p className="mt-1 text-sm text-muted">Manage reservations across your restaurants.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowManualModal(true)}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          + Walk-in / phone booking
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "")}
          className="rounded-xl border border-border px-3 py-2 text-sm text-ink outline-none"
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
          className="rounded-xl border border-border px-3 py-2 text-sm text-ink outline-none"
        />
      </div>

      {error ? (
        <ErrorState className="mt-8" message={error} onRetry={load} />
      ) : reservations === null ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={CalendarIcon}
          title="No bookings yet"
          message="Reservations from diners — and any walk-ins you add — will show up here."
        />
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
                <p className="mt-0.5 text-xs text-muted">
                  {r.user.phone ?? r.user.email ?? ""} · {r.confirmationCode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[r.status]}`}
                >
                  {r.status}
                </span>
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value as ReservationStatus)}
                  className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-ink outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <ManualBookingModal
        open={showManualModal}
        onClose={() => setShowManualModal(false)}
        restaurants={restaurants}
        token={token}
        onCreated={() => {
          setShowManualModal(false);
          load();
        }}
      />
    </main>
  );
}

interface ManualBookingModalProps {
  open: boolean;
  onClose: () => void;
  restaurants: RestaurantOwned[];
  token: string | null;
  onCreated: () => void;
}

function ManualBookingModal({ open, onClose, restaurants, token, onCreated }: ManualBookingModalProps) {
  const [restaurantId, setRestaurantId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("18:00");
  const [partySize, setPartySize] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>("INDOOR");
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && restaurants.length > 0 && !restaurantId) {
      setRestaurantId(restaurants[0].id);
    }
  }, [open, restaurants, restaurantId]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await createManualReservation(
        {
          restaurantId,
          guestName,
          guestPhone,
          date,
          time,
          partySize,
          seatingPreference,
          specialRequests: specialRequests || undefined,
        },
        token,
      );
      setGuestName("");
      setGuestPhone("");
      setSpecialRequests("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a walk-in / phone booking">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-label">Restaurant</label>
          <select
            required
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Guest name"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <TextField
          label="Guest phone"
          required
          placeholder="+85512345678"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            label="Time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Party size"
            type="number"
            min={1}
            required
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
          />
          <div>
            <label className="mb-2 block text-xs font-bold text-label">Seating</label>
            <select
              value={seatingPreference}
              onChange={(e) => setSeatingPreference(e.target.value as SeatingPreference)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm text-ink outline-none"
            >
              {SEATING_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TextAreaField
          label="Special requests (optional)"
          rows={2}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !restaurantId}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Booking…" : "Add booking"}
        </button>
      </form>
    </Modal>
  );
}
