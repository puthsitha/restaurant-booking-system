import type { StatusTone } from "@/components/ui/StatusBadge";
import type { ReservationStatus } from "@/lib/reservations/types";

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, StatusTone> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SEATED: "seated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "noShow",
};

export const RESERVATION_STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];
