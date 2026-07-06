"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { BookingDetailModal } from "@/components/reservations/BookingDetailModal";
import { DateField } from "@/components/ui/DateField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextAreaField, TextField } from "@/components/ui/FormField";
import { CalendarIcon, SearchOffIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { SearchField } from "@/components/ui/SearchField";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { formatRelativeDate, formatTimeLabel, parseIsoDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import {
  createManualReservation,
  listOwnerReservations,
  updateReservationStatus,
} from "@/lib/reservations/api";
import {
  RESERVATION_STATUS_LABEL_KEY,
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_STATUS_TONE,
} from "@/lib/reservations/statusTone";
import type {
  ListReservationsResponse,
  Reservation,
  ReservationStatus,
  SeatingPreference,
} from "@/lib/reservations/types";
import { listMyRestaurants } from "@/lib/restaurants/api";
import type { RestaurantSummary } from "@/lib/restaurants/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const SEATING_OPTIONS: SeatingPreference[] = ["INDOOR", "GARDEN", "PRIVATE"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function OwnerBookingsPage() {
  const { token } = useOwnerAuth();
  const { locale, t } = useLanguage();
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [result, setResult] = useState<ListReservationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showManualModal, setShowManualModal] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, restaurantFilter, statusFilter, dateFilter]);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listOwnerReservations(
      {
        restaurantId: restaurantFilter || undefined,
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
        setError(err instanceof ApiError ? err.message : t("ownerBookings.loadError"));
      });
  }, [token, restaurantFilter, statusFilter, dateFilter, debouncedSearch, page, t]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!token) return;
    listMyRestaurants({ pageSize: 50 }, token)
      .then((res) => setRestaurants(res.items))
      .catch(() => undefined);
  }, [token]);

  async function handleStatusChange(id: string, status: ReservationStatus): Promise<void> {
    if (!token) return;
    try {
      await updateReservationStatus(id, status, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerBookings.updateError"));
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{t("ownerBookings.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("ownerBookings.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowManualModal(true)}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          {t("ownerBookings.addWalkIn")}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("ownerBookings.searchPlaceholder")}
        />
        <Select
          value={restaurantFilter}
          onChange={setRestaurantFilter}
          options={[
            { value: "", label: t("ownerBookings.allRestaurants") },
            ...restaurants.map((r) => ({ value: r.id, label: r.name }))
          ]}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: t("ownerBookings.allStatuses") },
            ...RESERVATION_STATUS_OPTIONS.map((s) => ({ value: s, label: t(RESERVATION_STATUS_LABEL_KEY[s]) }))
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
        <EmptyState
          className="mt-8"
          icon={CalendarIcon}
          title={t("ownerBookings.emptyTitle")}
          message={t("ownerBookings.emptyMessage")}
        />
      ) : (
        <>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
            {result.items.map((r) => {
              const parsedDate = parseIsoDate(r.date.slice(0, 10));
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setDetailTarget(r)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-bold text-ink hover:text-accent">
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
                  </button>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={RESERVATION_STATUS_TONE[r.status]}>
                      {t(RESERVATION_STATUS_LABEL_KEY[r.status])}
                    </StatusBadge>
                    <Select
                      value={r.status}
                      onChange={(status) => handleStatusChange(r.id, status)}
                      options={RESERVATION_STATUS_OPTIONS.map((s) => ({
                        value: s,
                        label: t(RESERVATION_STATUS_LABEL_KEY[s])
                      }))}
                      className="min-w-[130px] py-1.5 text-xs"
                    />
                  </div>
                </div>
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

      <BookingDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} />
    </main>
  );
}

interface ManualBookingModalProps {
  open: boolean;
  onClose: () => void;
  restaurants: RestaurantSummary[];
  token: string | null;
  onCreated: () => void;
}

function ManualBookingModal({ open, onClose, restaurants, token, onCreated }: ManualBookingModalProps) {
  const { t } = useLanguage();
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
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("ownerBookings.modalTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={t("ownerBookings.restaurantLabel")}
          required
          value={restaurantId}
          onChange={setRestaurantId}
          options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
        />
        <TextField
          label={t("ownerBookings.guestName")}
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <TextField
          label={t("ownerBookings.guestPhone")}
          required
          placeholder={t("ownerBookings.guestPhonePlaceholder")}
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <DateField
            label={t("ownerBookings.date")}
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            label={t("ownerBookings.time")}
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t("ownerBookings.partySize")}
            type="number"
            min={1}
            required
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
          />
          <Select
            label={t("ownerBookings.seating")}
            value={seatingPreference}
            onChange={setSeatingPreference}
            options={SEATING_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <TextAreaField
          label={t("ownerBookings.specialRequestsOptional")}
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
          {submitting ? t("bookingWidget.booking") : t("ownerBookings.addBooking")}
        </button>
      </form>
    </Modal>
  );
}
