import type { DayOfWeek, Prisma, Reservation, RestaurantTable } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import type {
  CreateReservationInput,
  CreateManualReservationInput,
  UpdateReservationStatusInput,
  ListReservationsQuery,
  CheckAvailabilityQuery,
} from "../schemas/reservation.schemas";

// Statuses that still hold a table for a given date/time; cancelled/completed/
// no-show reservations free it back up.
const HOLDING_STATUSES: Reservation["status"][] = ["PENDING", "CONFIRMED", "SEATED"];
const TERMINAL_STATUSES: Reservation["status"][] = ["CANCELLED", "COMPLETED", "NO_SHOW"];

const DAY_OF_WEEK_BY_UTC_INDEX: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const reservationListInclude = {
  restaurant: { select: { id: true, name: true, slug: true, coverImageUrl: true } },
  user: { select: { id: true, name: true, phone: true, email: true } },
  table: true,
} satisfies Prisma.ReservationInclude;

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setUTCHours(hours, minutes, 0, 0);
  return combined;
}

// Finds the smallest table that fits the party and isn't already held by
// another active reservation at that exact date/time. Restaurants with no
// tables configured yet are treated as unmanaged capacity (always available).
async function findAvailableTable(
  restaurantId: string,
  date: Date,
  time: string,
  partySize: number,
): Promise<RestaurantTable | null> {
  const tables = await prisma.restaurantTable.findMany({
    where: { restaurantId, capacity: { gte: partySize } },
    orderBy: { capacity: "asc" },
  });
  if (tables.length === 0) return null;

  const busy = await prisma.reservation.findMany({
    where: { restaurantId, date, time, status: { in: HOLDING_STATUSES }, tableId: { not: null } },
    select: { tableId: true },
  });
  const busyTableIds = new Set(busy.map((r) => r.tableId));

  return tables.find((table) => !busyTableIds.has(table.id)) ?? null;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

export async function checkAvailability(
  restaurantId: string,
  query: CheckAvailabilityQuery,
): Promise<AvailabilityResult> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant || restaurant.status !== "ACTIVE") {
    return { available: false, reason: "This restaurant isn't accepting bookings right now" };
  }

  const { date, time, partySize } = query;

  if (
    partySize < restaurant.minCapacity ||
    (restaurant.maxCapacity > 0 && partySize > restaurant.maxCapacity)
  ) {
    return {
      available: false,
      reason:
        restaurant.maxCapacity > 0
          ? `Party size must be between ${restaurant.minCapacity} and ${restaurant.maxCapacity} guests`
          : `Party size must be at least ${restaurant.minCapacity} guests`,
    };
  }

  const requestedAt = combineDateAndTime(date, time);
  const earliestAllowed = new Date(Date.now() + restaurant.minBookingNotice * 60_000);
  if (requestedAt < earliestAllowed) {
    return {
      available: false,
      reason: `Bookings need at least ${restaurant.minBookingNotice} minutes' notice`,
    };
  }
  const latestAllowed = new Date(Date.now() + restaurant.maxBookingDays * 86_400_000);
  if (requestedAt > latestAllowed) {
    return {
      available: false,
      reason: `Bookings can only be made up to ${restaurant.maxBookingDays} days ahead`,
    };
  }

  const dayOfWeek = DAY_OF_WEEK_BY_UTC_INDEX[date.getUTCDay()];
  const hours = await prisma.operatingHours.findUnique({
    where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek } },
  });
  if (!hours || hours.isClosed) {
    return { available: false, reason: "Closed on this day" };
  }
  if (time < hours.openTime || time >= hours.closeTime) {
    return { available: false, reason: `Open ${hours.openTime}–${hours.closeTime} on this day` };
  }

  const closure = await prisma.specialClosure.findUnique({
    where: { restaurantId_date: { restaurantId, date } },
  });
  if (closure) {
    return { available: false, reason: closure.reason ?? "Closed on this date" };
  }

  const tableCount = await prisma.restaurantTable.count({ where: { restaurantId } });
  if (tableCount > 0) {
    const table = await findAvailableTable(restaurantId, date, time, partySize);
    if (!table) {
      return { available: false, reason: "Fully booked for this time" };
    }
  }

  return { available: true };
}

function generateConfirmationCode(): string {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `TS-${code}`;
}

async function uniqueConfirmationCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateConfirmationCode();
    const existing = await prisma.reservation.findUnique({ where: { confirmationCode: code } });
    if (!existing) return code;
  }
  throw new HttpError(500, "Couldn't generate a confirmation code, please try again");
}

async function assertAvailableOrThrow(
  restaurantId: string,
  input: { date: Date; time: string; partySize: number },
): Promise<void> {
  const availability = await checkAvailability(restaurantId, input);
  if (!availability.available) {
    throw new HttpError(409, availability.reason ?? "This time isn't available");
  }
}

async function getOwnedRestaurantOrThrow(id: string, ownerId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new HttpError(404, "Restaurant not found");
  }
  return restaurant;
}

// ========================= Diner booking =========================

export async function createReservation(userId: string, input: CreateReservationInput) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: input.restaurantId } });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  await assertAvailableOrThrow(input.restaurantId, input);
  const table = await findAvailableTable(input.restaurantId, input.date, input.time, input.partySize);
  const confirmationCode = await uniqueConfirmationCode();

  return prisma.reservation.create({
    data: {
      confirmationCode,
      restaurantId: input.restaurantId,
      userId,
      tableId: table?.id,
      date: input.date,
      time: input.time,
      partySize: input.partySize,
      seatingPreference: input.seatingPreference,
      specialRequests: input.specialRequests,
      depositAmount: restaurant.depositRequired ? restaurant.depositAmount : 0,
    },
    include: reservationListInclude,
  });
}

export async function listMyReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: reservationListInclude,
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
}

export async function cancelMyReservation(userId: string, reservationId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.userId !== userId) {
    throw new HttpError(404, "Reservation not found");
  }
  if (TERMINAL_STATUSES.includes(reservation.status)) {
    throw new HttpError(409, "This reservation can no longer be cancelled");
  }
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
    include: reservationListInclude,
  });
}

// ===================== Owner manual booking =======================

export async function createManualReservation(
  ownerId: string,
  input: CreateManualReservationInput,
) {
  const restaurant = await getOwnedRestaurantOrThrow(input.restaurantId, ownerId);
  await assertAvailableOrThrow(input.restaurantId, input);

  let guest = await prisma.user.findUnique({ where: { phone: input.guestPhone } });
  if (!guest) {
    guest = await prisma.user.create({
      data: { name: input.guestName, phone: input.guestPhone },
    });
  }

  const table = await findAvailableTable(input.restaurantId, input.date, input.time, input.partySize);
  const confirmationCode = await uniqueConfirmationCode();

  return prisma.reservation.create({
    data: {
      confirmationCode,
      restaurantId: input.restaurantId,
      userId: guest.id,
      tableId: table?.id,
      date: input.date,
      time: input.time,
      partySize: input.partySize,
      seatingPreference: input.seatingPreference,
      specialRequests: input.specialRequests,
      status: "CONFIRMED",
      depositAmount: restaurant.depositRequired ? restaurant.depositAmount : 0,
    },
    include: reservationListInclude,
  });
}

// ============================ Owner ================================

async function getOwnerReservationOrThrow(reservationId: string, ownerId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { restaurant: true },
  });
  if (!reservation || reservation.restaurant.ownerId !== ownerId) {
    throw new HttpError(404, "Reservation not found");
  }
  return reservation;
}

export async function updateReservationStatus(
  reservationId: string,
  ownerId: string,
  input: UpdateReservationStatusInput,
) {
  await getOwnerReservationOrThrow(reservationId, ownerId);
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: input.status },
    include: reservationListInclude,
  });
}

export async function listOwnerReservations(ownerId: string, query: ListReservationsQuery) {
  let restaurantIds: string[];
  if (query.restaurantId) {
    const restaurant = await getOwnedRestaurantOrThrow(query.restaurantId, ownerId);
    restaurantIds = [restaurant.id];
  } else {
    const owned = await prisma.restaurant.findMany({
      where: { ownerId },
      select: { id: true },
    });
    restaurantIds = owned.map((r) => r.id);
  }

  const where: Prisma.ReservationWhereInput = {
    restaurantId: { in: restaurantIds },
    ...(query.status ? { status: query.status } : {}),
    ...(query.date ? { date: query.date } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: reservationListInclude,
      orderBy: [{ date: "desc" }, { time: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.reservation.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

// ============================ Admin ================================
// Admin oversight is read-only: no status mutation is exposed to admins.

export async function listAllReservationsForAdmin(query: ListReservationsQuery) {
  const where: Prisma.ReservationWhereInput = {
    ...(query.restaurantId ? { restaurantId: query.restaurantId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.date ? { date: query.date } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: reservationListInclude,
      orderBy: [{ date: "desc" }, { time: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.reservation.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}
