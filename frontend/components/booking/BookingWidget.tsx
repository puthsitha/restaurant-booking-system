"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { QrCode } from "@/components/ui/QrCode";
import { CalendarIcon, CheckIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useAuthModal } from "@/lib/auth/authModal";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { confirmPayment, createPayment } from "@/lib/payments/api";
import type { Payment } from "@/lib/payments/types";
import { checkAvailability, createReservation } from "@/lib/reservations/api";
import type { AvailabilityResult, Reservation, SeatingPreference } from "@/lib/reservations/types";
import type { DayOfWeek, RestaurantPublicDetail } from "@/lib/restaurants/types";

const DAY_ORDER: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const SEATING_OPTIONS: { value: SeatingPreference; label: string }[] = [
  { value: "INDOOR", label: "Indoor" },
  { value: "GARDEN", label: "Garden" },
  { value: "PRIVATE", label: "Private room" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateTimeSlots(openTime: string, closeTime: string, stepMinutes = 30): string[] {
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const slots: string[] = [];
  let minutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  while (minutes < closeMinutes) {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    minutes += stepMinutes;
  }
  return slots;
}

interface BookingWidgetProps {
  restaurant: RestaurantPublicDetail;
}

export function BookingWidget({ restaurant }: BookingWidgetProps) {
  const { token, status } = useCustomerAuth();
  const { open: openLogin } = useAuthModal();

  const [date, setDate] = useState(addDaysIso(1));
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(Math.max(2, restaurant.minCapacity));
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>("INDOOR");
  const [specialRequests, setSpecialRequests] = useState("");

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [payingConfirm, setPayingConfirm] = useState(false);
  const [paid, setPaid] = useState(false);

  const hoursByDay = useMemo(
    () => new Map(restaurant.operatingHours.map((h) => [h.dayOfWeek, h])),
    [restaurant.operatingHours],
  );
  const closureDates = useMemo(
    () => new Set(restaurant.specialClosures.map((c) => c.date.slice(0, 10))),
    [restaurant.specialClosures],
  );

  const selectedDayHours = useMemo(() => {
    if (!date) return null;
    const dayOfWeek = DAY_ORDER[new Date(date).getUTCDay()];
    return hoursByDay.get(dayOfWeek) ?? null;
  }, [date, hoursByDay]);

  const isClosedDate = closureDates.has(date);
  const timeSlots = useMemo(() => {
    if (!selectedDayHours || selectedDayHours.isClosed || isClosedDate) return [];
    return generateTimeSlots(selectedDayHours.openTime, selectedDayHours.closeTime);
  }, [selectedDayHours, isClosedDate]);

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(time)) {
      setTime(timeSlots[0]);
    } else if (timeSlots.length === 0) {
      setTime("");
    }
  }, [timeSlots, time]);

  useEffect(() => {
    setAvailability(null);
    if (!date || !time || !partySize) return;
    setChecking(true);
    const handle = setTimeout(() => {
      checkAvailability(restaurant.id, { date, time, partySize })
        .then(setAvailability)
        .catch(() => setAvailability(null))
        .finally(() => setChecking(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [restaurant.id, date, time, partySize]);

  async function handleSubmit(): Promise<void> {
    if (status !== "authenticated" || !token) {
      openLogin();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { reservation } = await createReservation(
        { restaurantId: restaurant.id, date, time, partySize, seatingPreference, specialRequests: specialRequests || undefined },
        token,
      );
      setConfirmed(reservation);
      setPaid(false);
      setPayment(null);
      if (Number(reservation.depositAmount) > 0) {
        const { payment: created } = await createPayment(reservation.id, token);
        setPayment(created);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmPayment(): Promise<void> {
    if (!confirmed || !token) return;
    setPayingConfirm(true);
    try {
      await confirmPayment(confirmed.id, token);
      setPaid(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't confirm payment, please try again.");
    } finally {
      setPayingConfirm(false);
    }
  }

  function closeConfirmation(): void {
    setConfirmed(null);
    setPayment(null);
    setPaid(false);
  }

  const maxDate = addDaysIso(restaurant.maxBookingDays);
  const canSubmit = Boolean(date && time && partySize) && !submitting;

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-accent" />
        <h2 className="disp text-lg font-bold text-ink">Reserve a table</h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">Date</label>
          <input
            type="date"
            value={date}
            min={todayIso()}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">Party size</label>
          <input
            type="number"
            min={restaurant.minCapacity}
            max={restaurant.maxCapacity > 0 ? restaurant.maxCapacity : 50}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-bold text-label">Time</label>
        {timeSlots.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted">
            {isClosedDate ? "Closed on this date" : "Closed on this day"}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  time === slot ? "bg-accent text-white" : "bg-bg text-ink hover:bg-border/60"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-bold text-label">Seating</label>
        <div className="flex gap-1.5">
          {SEATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSeatingPreference(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                seatingPreference === opt.value ? "bg-accent text-white" : "bg-bg text-ink hover:bg-border/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-bold text-label">
          Special requests <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={2}
          placeholder="Birthday, allergies, high chair…"
          className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <AnimatePresence mode="wait">
        {time && (checking || availability) && (
          <motion.p
            key={availability?.available ? "ok" : availability?.reason ?? "checking"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 text-xs font-semibold ${
              checking ? "text-muted" : availability?.available ? "text-secondary" : "text-red-600"
            }`}
          >
            {checking
              ? "Checking availability…"
              : availability?.available
                ? "This time is available"
                : (availability?.reason ?? "Not available")}
          </motion.p>
        )}
      </AnimatePresence>

      {restaurant.depositRequired && (
        <p className="mt-3 text-xs text-muted">
          A ${Number(restaurant.depositAmount).toFixed(2)} deposit is required to secure this booking.
        </p>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {status !== "authenticated" ? "Sign in to reserve" : submitting ? "Booking…" : "Reserve a table"}
      </button>

      <Modal
        open={confirmed !== null}
        onClose={closeConfirmation}
        title={confirmed && payment && !paid ? "Pay your deposit" : "Table reserved!"}
      >
        {confirmed && payment && !paid ? (
          <div className="text-center">
            <div
              className="mx-auto flex items-center justify-between gap-3 rounded-t-xl px-4 py-2.5 text-xs font-bold text-white"
              style={{ background: "linear-gradient(90deg,#C2410C,#E85D2C)" }}
            >
              <span>KHQR</span>
              <span>${Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="rounded-b-xl border border-t-0 border-border p-5">
              <QrCode value={payment.khqrPayload ?? payment.id} size={180} className="mx-auto" />
              <p className="mt-3 text-sm text-ink">
                Scan with any KHQR-enabled banking app to pay{" "}
                <span className="font-bold">${Number(payment.amount).toFixed(2)}</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                Or pay via ABA · Wing · Bakong · ACLEDA at the restaurant
              </p>
            </div>
            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={payingConfirm}
              className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {payingConfirm ? "Confirming…" : "I've paid"}
            </button>
            <p className="mt-2 text-[11px] text-muted">
              Simulated for this demo — no real payment gateway is connected.
            </p>
          </div>
        ) : (
          confirmed && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <CheckIcon className="h-7 w-7" />
              </div>
              <p className="disp mt-4 text-2xl font-extrabold text-ink">{confirmed.confirmationCode}</p>
              <p className="mt-1 text-sm text-muted">
                {confirmed.date.slice(0, 10)} at {confirmed.time} · {confirmed.partySize} guests
              </p>
              <p className="mt-3 text-sm text-ink">
                We&apos;ve sent this to your account. Show this check-in code when you arrive.
              </p>
              <QrCode value={confirmed.confirmationCode} size={140} className="mx-auto mt-4" />
              <button
                type="button"
                onClick={closeConfirmation}
                className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
