import { apiFetch } from "@/lib/api";
import type {
  AvailabilityResult,
  ListReservationsParams,
  ListReservationsResponse,
  Reservation,
  ReservationStatus,
  SeatingPreference,
} from "@/lib/reservations/types";

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ========================= Diner booking =========================

export interface CheckAvailabilityParams {
  date: string;
  time: string;
  partySize: number;
}

export function checkAvailability(
  restaurantId: string,
  params: CheckAvailabilityParams,
): Promise<AvailabilityResult> {
  return apiFetch(
    `/api/restaurants/${restaurantId}/availability${toQueryString(params as unknown as Record<string, string | number | undefined>)}`,
  );
}

export interface CreateReservationInput {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
  seatingPreference?: SeatingPreference;
  specialRequests?: string;
}

export function createReservation(
  input: CreateReservationInput,
  token: string,
): Promise<{ reservation: Reservation }> {
  return apiFetch("/api/reservations", { method: "POST", body: input, token });
}

export function listMyReservations(token: string): Promise<{ reservations: Reservation[] }> {
  return apiFetch("/api/reservations/mine", { token });
}

export function cancelMyReservation(
  id: string,
  token: string,
): Promise<{ reservation: Reservation }> {
  return apiFetch(`/api/reservations/${id}/cancel`, { method: "PATCH", token });
}

// ===================== Owner manual booking =======================

export interface CreateManualReservationInput extends CreateReservationInput {
  guestName: string;
  guestPhone: string;
}

export function createManualReservation(
  input: CreateManualReservationInput,
  token: string,
): Promise<{ reservation: Reservation }> {
  return apiFetch("/api/reservations/manual", { method: "POST", body: input, token });
}

// ============================ Owner ================================

export function listOwnerReservations(
  params: ListReservationsParams,
  token: string,
): Promise<ListReservationsResponse> {
  return apiFetch(
    `/api/reservations${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

export function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  token: string,
): Promise<{ reservation: Reservation }> {
  return apiFetch(`/api/reservations/${id}/status`, { method: "PATCH", body: { status }, token });
}

// ============================ Admin ================================

export function listAllReservationsAdmin(
  params: ListReservationsParams,
  token: string,
): Promise<ListReservationsResponse> {
  return apiFetch(
    `/api/reservations/all${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

// ============================ Stats =================================

export interface DailyBookingCount {
  date: string;
  count: number;
}

export function getOwnerBookingStats(
  days: number,
  token: string,
): Promise<{ days: DailyBookingCount[] }> {
  return apiFetch(`/api/reservations/stats?days=${days}`, { token });
}

export function getAdminBookingStats(
  days: number,
  token: string,
): Promise<{ days: DailyBookingCount[] }> {
  return apiFetch(`/api/reservations/stats/all?days=${days}`, { token });
}
