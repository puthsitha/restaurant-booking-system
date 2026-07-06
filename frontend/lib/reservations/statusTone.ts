import type { StatusTone } from "@/components/ui/StatusBadge";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { ReservationStatus } from "@/lib/reservations/types";

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, StatusTone> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SEATED: "seated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "noShow",
};

export const RESERVATION_STATUS_LABEL_KEY: Record<ReservationStatus, TranslationKey> = {
  PENDING: "reservationStatus.pending",
  CONFIRMED: "reservationStatus.confirmed",
  SEATED: "reservationStatus.seated",
  COMPLETED: "reservationStatus.completed",
  CANCELLED: "reservationStatus.cancelled",
  NO_SHOW: "reservationStatus.noShow",
};

export const RESERVATION_STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];
