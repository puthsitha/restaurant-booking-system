"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DateField } from "@/components/ui/DateField";
import { Modal } from "@/components/ui/Modal";
import { QrCodeViewer } from "@/components/ui/QrCodeViewer";
import { CalendarIcon, CheckIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useAuthModal } from "@/lib/auth/authModal";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { formatRelativeDate, formatTimeLabel, parseIsoDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
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

const SEATING_VALUES: SeatingPreference[] = ["INDOOR", "GARDEN", "PRIVATE"];
const SEATING_LABEL_KEY: Record<SeatingPreference, "bookingWidget.seatingIndoor" | "bookingWidget.seatingGarden" | "bookingWidget.seatingPrivate"> = {
  INDOOR: "bookingWidget.seatingIndoor",
  GARDEN: "bookingWidget.seatingGarden",
  PRIVATE: "bookingWidget.seatingPrivate",
};

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

const DEFAULT_SEATING: SeatingPreference = "INDOOR";

export function BookingWidget({ restaurant }: BookingWidgetProps) {
  const { token, status } = useCustomerAuth();
  const { open: openLogin } = useAuthModal();
  const { locale, t } = useLanguage();
  const router = useRouter();

  const defaultDate = addDaysIso(1);
  const defaultPartySize = Math.max(2, restaurant.minCapacity);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(defaultPartySize);
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>(DEFAULT_SEATING);
  const [specialRequests, setSpecialRequests] = useState("");

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
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

  function handleReserveClick(): void {
    if (status !== "authenticated" || !token) {
      openLogin();
      return;
    }
    setShowConfirmStep(true);
  }

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
      setShowConfirmStep(false);
      setConfirmed(reservation);
      setPaid(false);
      setPayment(null);
      if (Number(reservation.depositAmount) > 0) {
        const { payment: created } = await createPayment(reservation.id, token);
        setPayment(created);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.somethingWentWrong"));
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
      setError(err instanceof ApiError ? err.message : t("bookingWidget.couldntConfirmPayment"));
    } finally {
      setPayingConfirm(false);
    }
  }

  function closeConfirmation(): void {
    setConfirmed(null);
    setPayment(null);
    setPaid(false);
  }

  function resetBookingForm(): void {
    setDate(defaultDate);
    setPartySize(defaultPartySize);
    setSeatingPreference(DEFAULT_SEATING);
    setSpecialRequests("");
  }

  function handleDone(): void {
    closeConfirmation();
    resetBookingForm();
  }

  function handleSeeTicket(): void {
    closeConfirmation();
    resetBookingForm();
    router.push("/bookings");
  }

  const maxDate = addDaysIso(restaurant.maxBookingDays);
  const canSubmit = Boolean(date && time && partySize) && !submitting;
  const selectedDateLabel = useMemo(() => {
    const parsed = parseIsoDate(date);
    return parsed ? formatRelativeDate(parsed, locale, t) : date;
  }, [date, locale, t]);
  const confirmedDateLabel = useMemo(() => {
    if (!confirmed) return "";
    const parsed = parseIsoDate(confirmed.date.slice(0, 10));
    return parsed ? formatRelativeDate(parsed, locale, t) : confirmed.date.slice(0, 10);
  }, [confirmed, locale, t]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-accent" />
        <h2 className="disp text-lg font-bold text-ink">{t("bookingWidget.reserveTable")}</h2>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-bold text-label">{t("bookingWidget.date")}</label>
        <DateField
          value={date}
          min={todayIso()}
          max={maxDate}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">{t("bookingWidget.partySize")}</label>
          <input
            type="number"
            min={restaurant.minCapacity}
            max={restaurant.maxCapacity > 0 ? restaurant.maxCapacity : 50}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-label">{t("bookingWidget.seating")}</label>
          <div className="flex flex-wrap gap-1.5">
            {SEATING_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSeatingPreference(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  seatingPreference === value ? "bg-accent text-white" : "bg-bg text-ink hover:bg-border/60"
                }`}
              >
                {t(SEATING_LABEL_KEY[value])}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-bold text-label">{t("bookingWidget.time")}</label>
        {timeSlots.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted">
            {isClosedDate ? t("bookingWidget.closedOnDate") : t("bookingWidget.closedOnDay")}
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
                {formatTimeLabel(slot, locale, t)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-bold text-label">
          {t("bookingWidget.specialRequests")} <span className="font-normal text-muted">{t("bookingWidget.optional")}</span>
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={2}
          placeholder={t("bookingWidget.specialRequestsPlaceholder")}
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
              ? t("bookingWidget.checkingAvailability")
              : availability?.available
                ? t("bookingWidget.available")
                : (availability?.reason ?? t("bookingWidget.notAvailable"))}
          </motion.p>
        )}
      </AnimatePresence>

      {restaurant.depositRequired && (
        <p className="mt-3 text-xs text-muted">
          {t("bookingWidget.depositNotice", { amount: `$${Number(restaurant.depositAmount).toFixed(2)}` })}
        </p>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleReserveClick}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {status !== "authenticated"
          ? t("bookingWidget.signInToReserve")
          : submitting
            ? t("bookingWidget.booking")
            : t("bookingWidget.reserveTable")}
      </button>

      <Modal
        open={showConfirmStep}
        onClose={() => setShowConfirmStep(false)}
        title={t("bookingWidget.confirmReservation")}
      >
        <div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t("bookingWidget.restaurant")}</dt>
              <dd className="text-right font-semibold text-ink">{restaurant.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t("bookingWidget.dateTime")}</dt>
              <dd className="text-right font-semibold text-ink">
                {selectedDateLabel} {t("bookingsPage.at")} {formatTimeLabel(time, locale, t)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t("bookingWidget.partySize")}</dt>
              <dd className="text-right font-semibold text-ink">
                {t("bookingWidget.guestsCount", { count: partySize })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t("bookingWidget.seating")}</dt>
              <dd className="text-right font-semibold text-ink">
                {t(SEATING_LABEL_KEY[seatingPreference])}
              </dd>
            </div>
            {specialRequests && (
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-muted">{t("bookingWidget.specialRequestsLabel")}</dt>
                <dd className="text-right font-semibold text-ink">{specialRequests}</dd>
              </div>
            )}
          </dl>
          {restaurant.depositRequired && (
            <p className="mt-4 rounded-xl bg-bg p-3 text-xs text-ink">
              {t("bookingWidget.depositWillBeRequired", {
                amount: `$${Number(restaurant.depositAmount).toFixed(2)}`,
              })}
            </p>
          )}
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmStep(false)}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink"
            >
              {t("bookingWidget.goBack")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? t("bookingWidget.booking") : t("bookingWidget.confirmBooking")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmed !== null}
        onClose={closeConfirmation}
        title={confirmed && payment && !paid ? t("bookingWidget.payDeposit") : t("bookingWidget.tableReserved")}
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
              <QrCodeViewer
                value={payment.khqrPayload ?? payment.id}
                size={180}
                className="mx-auto"
                label="KHQR payment"
                downloadName={`khqr-payment-${confirmed?.confirmationCode ?? payment.id}`}
              />
              <p className="mt-3 text-sm text-ink">
                {t("bookingWidget.scanToPay")}
                <span className="font-bold">${Number(payment.amount).toFixed(2)}</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {t("bookingWidget.payAtRestaurant")}
              </p>
            </div>
            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={payingConfirm}
              className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {payingConfirm ? t("bookingWidget.confirming") : t("bookingWidget.ivePaid")}
            </button>
            <p className="mt-2 text-[11px] text-muted">
              {t("bookingWidget.simulatedDemo")}
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
                {confirmedDateLabel} {t("bookingsPage.at")} {formatTimeLabel(confirmed.time, locale, t)} ·{" "}
                {t("bookingWidget.guestsCount", { count: confirmed.partySize })}
              </p>
              <p className="mt-3 text-sm text-ink">
                {t("bookingWidget.sentToAccount")}
              </p>
              <QrCodeViewer
                value={confirmed.confirmationCode}
                size={140}
                className="mx-auto mt-4"
                label={t("bookingWidget.checkInCode")}
                downloadName={`check-in-${confirmed.confirmationCode}`}
              />
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={handleDone}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-ink"
                >
                  {t("bookingWidget.done")}
                </button>
                <button
                  type="button"
                  onClick={handleSeeTicket}
                  className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-white"
                >
                  {t("bookingWidget.seeTicket")}
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
