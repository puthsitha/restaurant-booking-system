import { randomBytes } from "node:crypto";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";

async function getOwnedReservationOrThrow(userId: string, reservationId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.userId !== userId) {
    throw new HttpError(404, "Reservation not found");
  }
  return reservation;
}

// Not a real EMV-KHQR payload — no payment gateway is wired up in this
// scaffold. This just gives the QR code something deterministic-looking to
// render; `confirmPayment` below simulates the customer having paid.
function generateKhqrPayload(reservationId: string, amount: string): string {
  return `KHQR|TableSite|${reservationId}|${amount}|${randomBytes(6).toString("hex")}`;
}

export async function getOrCreatePayment(userId: string, reservationId: string) {
  const reservation = await getOwnedReservationOrThrow(userId, reservationId);
  if (Number(reservation.depositAmount) <= 0) {
    throw new HttpError(400, "This reservation has no deposit due");
  }

  const existing = await prisma.payment.findUnique({ where: { reservationId } });
  if (existing) {
    return existing;
  }

  return prisma.payment.create({
    data: {
      reservationId,
      channel: "KHQR",
      amount: reservation.depositAmount,
      khqrPayload: generateKhqrPayload(reservationId, reservation.depositAmount.toString()),
    },
  });
}

// Dev-simulated "the customer paid" confirmation — there is no real payment
// gateway integration here, mirroring this codebase's other simulated
// external providers (e.g. the OTP `devCode` in auth.service.ts).
export async function confirmPayment(userId: string, reservationId: string) {
  const reservation = await getOwnedReservationOrThrow(userId, reservationId);

  const payment = await prisma.payment.findUnique({ where: { reservationId } });
  if (!payment) {
    throw new HttpError(404, "No payment found for this reservation");
  }
  if (payment.status === "PAID") {
    return payment;
  }

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { reservationId },
      data: { status: "PAID", paidAt: new Date() },
    });
    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        depositPaid: true,
        // Paying the deposit confirms a still-pending booking; leave a
        // booking that's already progressed further (seated, etc.) alone.
        ...(reservation.status === "PENDING" ? { status: "CONFIRMED" } : {}),
      },
    });
    return updatedPayment;
  });
}

export async function getPayment(userId: string, reservationId: string) {
  await getOwnedReservationOrThrow(userId, reservationId);
  const payment = await prisma.payment.findUnique({ where: { reservationId } });
  if (!payment) {
    throw new HttpError(404, "No payment found for this reservation");
  }
  return payment;
}
