import type { TableStatus } from "@/lib/restaurants/types";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type SeatingPreference = "INDOOR" | "GARDEN" | "PRIVATE";

export interface ReservationUser {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface ReservationTable {
  id: string;
  tableNumber: string;
  capacity: number;
  floor: string | null;
  zone: string | null;
  description: string | null;
  status: TableStatus;
}

export interface ReservationRestaurant {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
}

export interface Reservation {
  id: string;
  confirmationCode: string;
  restaurantId: string;
  restaurant: ReservationRestaurant;
  userId: string;
  user: ReservationUser;
  tableId: string | null;
  table: ReservationTable | null;
  date: string;
  time: string;
  partySize: number;
  seatingPreference: SeatingPreference;
  specialRequests: string | null;
  status: ReservationStatus;
  // Prisma Decimal fields serialize to strings over JSON.
  depositAmount: string;
  depositPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListReservationsResponse {
  items: Reservation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListReservationsParams {
  restaurantId?: string;
  status?: ReservationStatus;
  date?: string;
  // Matches the customer's name/phone or the restaurant's name.
  search?: string;
  page?: number;
  pageSize?: number;
}

// GET /api/reservations/mine (diner) — no filters, just pagination.
export interface ListMyReservationsParams {
  page?: number;
  pageSize?: number;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}
