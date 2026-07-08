"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarIcon, ChairIcon, ClockIcon, UsersIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { QrCodeViewer } from "@/components/ui/QrCodeViewer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ListSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { formatRelativeDate, formatTimeLabel, parseIsoDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cancelMyReservation, listMyReservations } from "@/lib/reservations/api";
import { RESERVATION_STATUS_LABEL_KEY } from "@/lib/reservations/statusTone";
import type { ListReservationsResponse, Reservation, ReservationStatus } from "@/lib/reservations/types";

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
  const { locale, t } = useLanguage();

  function formatReservationDate(iso: string): string {
    const parsed = parseIsoDate(iso.slice(0, 10));
    return parsed ? formatRelativeDate(parsed, locale, t) : iso.slice(0, 10);
  }
  const [result, setResult] = useState<ListReservationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    listMyReservations({ page, pageSize: 8 }, token)
      .then((res) => setResult(res))
      .catch(() => setError(t("bookingsPage.loadError")));
  }, [token, page, t]);

  useEffect(load, [load]);

  const visible = useMemo(() => {
    if (!result) return null;
    const isPast = (r: Reservation) => PAST_STATUSES.includes(r.status);
    return result.items.filter((r) => (tab === "past" ? isPast(r) : !isPast(r)));
  }, [result, tab]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  async function handleCancel(): Promise<void> {
    if (!toCancel || !token) return;
    setCancelling(true);
    try {
      await cancelMyReservation(toCancel.id, token);
      setToCancel(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("bookingsPage.cancelError"));
    } finally {
      setCancelling(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <main className="mx-auto max-w-[920px] px-8 py-12">
        <ListSkeleton rows={3} />
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <main className="mx-auto max-w-[920px] px-8 py-12">
        <Breadcrumb
          className="mb-4"
          items={[{ label: t("common.home"), href: "/" }, { label: t("bookingsPage.title") }]}
        />
        <EmptyState
          icon={CalendarIcon}
          title={t("bookingsPage.signInTitle")}
          message={t("bookingsPage.signInMessage")}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[920px] px-8 py-12">
      <Breadcrumb
        className="mb-4"
        items={[{ label: t("common.home"), href: "/" }, { label: t("bookingsPage.title") }]}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="disp text-2xl font-extrabold text-ink">{t("bookingsPage.title")}</h1>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: t("bookingsPage.tabUpcoming") },
            { value: "past", label: t("bookingsPage.tabPast") },
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
          title={tab === "past" ? t("bookingsPage.emptyPastTitle") : t("bookingsPage.emptyUpcomingTitle")}
          message={t("bookingsPage.emptyMessage")}
          actionLabel={t("bookingsPage.browseRestaurants")}
          actionHref="/search"
        />
      ) : (
        <motion.div
          className="mt-8 space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {visible.map((r) => {
            const showQr = tab === "upcoming" && !PAST_STATUSES.includes(r.status);
            return (
              <motion.div
                key={r.id}
                variants={fadeUp}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface sm:flex-row"
              >
                <div className="h-40 w-full shrink-0 sm:h-auto sm:w-48">
                  {r.restaurant.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.restaurant.coverImageUrl}
                      alt={r.restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-bg text-3xl">🍽️</div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">{r.restaurant.name}</p>
                      <StatusBadge tone={STATUS_TONE[r.status]}>
                        {t(RESERVATION_STATUS_LABEL_KEY[r.status])}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">
                      {r.restaurant.cuisine.name} · {r.restaurant.address}
                    </p>
                    {!showQr && (
                      <p className="mt-1 text-xs text-muted">
                        {t("bookingsPage.confirmation", { code: r.confirmationCode })}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <CalendarIcon className="h-3.5 w-3.5" /> {t("bookingsPage.dateLabel")}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-ink">{formatReservationDate(r.date)}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <ClockIcon className="h-3.5 w-3.5" /> {t("bookingsPage.timeLabel")}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-ink">{formatTimeLabel(r.time, locale, t)}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <UsersIcon className="h-3.5 w-3.5" /> {t("bookingsPage.partyLabel")}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-ink">
                          {t("bookingsPage.guestsCount", { count: r.partySize })}
                        </p>
                      </div>
                      {r.table && (
                        <div>
                          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                            <ChairIcon className="h-3.5 w-3.5" /> {t("bookingsPage.tableLabel")}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-ink">{r.table.tableNumber}</p>
                        </div>
                      )}
                    </div>

                    {CANCELLABLE.includes(r.status) && (
                      <button
                        type="button"
                        onClick={() => setToCancel(r)}
                        className="mt-4 rounded-lg border border-border px-4 py-2 text-xs font-bold text-ink transition hover:bg-bg"
                      >
                        {t("bookingsPage.cancelBooking")}
                      </button>
                    )}
                  </div>

                  {showQr && (
                    <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-t border-dashed border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      <QrCodeViewer
                        value={r.confirmationCode}
                        size={88}
                        label={t("bookingsPage.checkInCode")}
                        downloadName={`check-in-${r.confirmationCode}`}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                        {t("bookingsPage.showOnArrival")}
                      </span>
                      <span className="text-sm font-extrabold text-accent">{r.confirmationCode}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {result && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {t("bookingsPage.previous")}
          </button>
          <span className="text-sm text-muted">{t("bookingsPage.pageOf", { page, total: totalPages })}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {t("bookingsPage.next")}
          </button>
        </div>
      )}

      <Modal open={toCancel !== null} onClose={() => setToCancel(null)} title={t("bookingsPage.cancelModalTitle")}>
        {toCancel && (
          <div>
            <p className="text-sm text-ink">
              {toCancel.restaurant.name} · {formatReservationDate(toCancel.date)} {t("bookingsPage.at")}{" "}
              {formatTimeLabel(toCancel.time, locale, t)} ·{" "}
              {t("bookingsPage.guestsCount", { count: toCancel.partySize })}
            </p>
            <p className="mt-2 text-sm text-muted">{t("bookingsPage.cancelModalBody")}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setToCancel(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink"
              >
                {t("bookingsPage.keepBooking")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {cancelling ? t("bookingsPage.cancelling") : t("bookingsPage.cancelBooking")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
