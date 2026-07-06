"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelativeDate, parseIsoDate } from "@/lib/dateFormat";
import { useLanguage } from "@/lib/i18n/context";
import { RESERVATION_STATUS_TONE } from "@/lib/reservations/statusTone";
import type { Reservation } from "@/lib/reservations/types";
import { theme } from "@/lib/theme";

interface BookingDetailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  // Owner/admin views show the restaurant name; a restaurant's own booking
  // list doesn't need to repeat it, so this stays optional.
  showRestaurant?: boolean;
}

function money(amount: string): string {
  const usd = Number(amount);
  return `$${usd.toFixed(2)} · ៛${Math.round(usd * theme.currency.usdToKhrRate).toLocaleString()}`;
}

const SEATING_LABEL_KEY = {
  INDOOR: "bookingWidget.seatingIndoor",
  GARDEN: "bookingWidget.seatingGarden",
  PRIVATE: "bookingWidget.seatingPrivate"
} as const;

// Read-only "everything about this booking" panel shared by the owner and
// admin bookings pages — status changes stay in the row actions, this modal
// is purely for inspecting the full record.
export function BookingDetailModal({
  reservation,
  onClose,
  showRestaurant = true,
}: BookingDetailModalProps) {
  const { locale, t } = useLanguage();
  const parsedDate = reservation ? parseIsoDate(reservation.date.slice(0, 10)) : null;
  return (
    <Modal open={reservation !== null} onClose={onClose} title={t("bookingDetailModal.title")}>
      {reservation && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={reservation.user.name} />
              <div>
                <p className="font-bold text-ink">{reservation.user.name}</p>
                <p className="text-xs text-muted">
                  {reservation.user.phone ?? reservation.user.email ?? "—"}
                </p>
              </div>
            </div>
            <StatusBadge tone={RESERVATION_STATUS_TONE[reservation.status]}>
              {reservation.status}
            </StatusBadge>
          </div>

          <div className="rounded-xl bg-bg p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("bookingDetailModal.confirmationCode")}
            </p>
            <p className="disp mt-1 text-xl font-extrabold text-ink">
              {reservation.confirmationCode}
            </p>
          </div>

          <dl className="space-y-2.5 text-sm">
            {showRestaurant && (
              <Row label={t("bookingDetailModal.restaurant")} value={reservation.restaurant.name} />
            )}
            <Row
              label={t("bookingDetailModal.dateTime")}
              value={`${parsedDate ? formatRelativeDate(parsedDate, locale, t) : reservation.date.slice(0, 10)} ${t("bookingsPage.at")} ${reservation.time}`}
            />
            <Row
              label={t("bookingDetailModal.partySize")}
              value={t("bookingWidget.guestsCount", { count: reservation.partySize })}
            />
            <Row
              label={t("bookingDetailModal.seating")}
              value={t(SEATING_LABEL_KEY[reservation.seatingPreference])}
            />
            <Row
              label={t("bookingDetailModal.table")}
              value={
                reservation.table
                  ? `${reservation.table.tableNumber}${reservation.table.zone ? ` · ${reservation.table.zone}` : ""}`
                  : t("bookingDetailModal.notAssigned")
              }
            />
            <Row
              label={t("bookingDetailModal.deposit")}
              value={
                Number(reservation.depositAmount) > 0
                  ? `${money(reservation.depositAmount)} · ${
                      reservation.depositPaid ? t("bookingDetailModal.paid") : t("bookingDetailModal.unpaid")
                    }`
                  : t("bookingDetailModal.notRequired")
              }
            />
            <Row
              label={t("bookingDetailModal.booked")}
              value={new Date(reservation.createdAt).toLocaleString()}
            />
          </dl>

          {reservation.specialRequests && (
            <div>
              <p className="text-xs font-bold text-label">{t("bookingDetailModal.specialRequests")}</p>
              <p className="mt-1.5 rounded-xl bg-bg p-3 text-sm text-ink">
                {reservation.specialRequests}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
