import { z } from "zod";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
// E.164 Cambodian mobile number, e.g. "+85512345678".
const CAMBODIAN_PHONE = /^\+855[1-9]\d{7,8}$/;

export const reservationStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);
export const seatingPreferenceEnum = z.enum(["INDOOR", "GARDEN", "PRIVATE"]);

// ========================= Diner booking =========================

export const createReservationSchema = z.object({
  restaurantId: z.string().min(1),
  date: z.coerce.date(),
  time: z.string().regex(HHMM, "Use HH:MM 24-hour format"),
  partySize: z.number().int().min(1).max(50),
  seatingPreference: seatingPreferenceEnum.default("INDOOR"),
  specialRequests: z.string().trim().max(500).optional(),
});
export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const checkAvailabilityQuerySchema = z.object({
  date: z.coerce.date(),
  time: z.string().regex(HHMM, "Use HH:MM 24-hour format"),
  partySize: z.coerce.number().int().min(1).max(50),
});
export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilityQuerySchema>;

// ===================== Owner manual booking =======================

export const createManualReservationSchema = createReservationSchema.extend({
  guestName: z.string().trim().min(1).max(120),
  guestPhone: z.string().trim().regex(CAMBODIAN_PHONE, "Enter a valid Cambodian phone number"),
});
export type CreateManualReservationInput = z.infer<typeof createManualReservationSchema>;

// ============================ Status ==============================

export const updateReservationStatusSchema = z.object({
  status: reservationStatusEnum,
});
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;

// ============================ Listing ==============================

export const listReservationsQuerySchema = z.object({
  restaurantId: z.string().min(1).optional(),
  status: reservationStatusEnum.optional(),
  date: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;
