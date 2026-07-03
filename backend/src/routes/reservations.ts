import { Router } from "express";

import * as paymentController from "../controllers/payment.controller";
import * as reservationController from "../controllers/reservation.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createReservationSchema,
  createManualReservationSchema,
  updateReservationStatusSchema,
  listReservationsQuerySchema,
  checkAvailabilityQuerySchema,
  bookingStatsQuerySchema,
} from "../schemas/reservation.schemas";

export const reservationsRouter: Router = Router();

const dinerOnly = [authenticate, requireRole("DINER")];
const ownerOnly = [authenticate, requireRole("OWNER")];
const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/restaurants/{id}/availability:
 *   get:
 *     summary: Check whether a date/time/party size is bookable (public)
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: time
 *         required: true
 *         schema: { type: string, example: "19:30" }
 *       - in: query
 *         name: partySize
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get(
  "/api/restaurants/:id/availability",
  validateQuery(checkAvailabilityQuerySchema),
  reservationController.checkAvailability,
);

/**
 * @openapi
 * /api/reservations:
 *   post:
 *     summary: Book a table (diner)
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       409: { description: The requested time isn't available }
 */
reservationsRouter.post(
  "/api/reservations",
  dinerOnly,
  validateBody(createReservationSchema),
  reservationController.create,
);

/**
 * @openapi
 * /api/reservations/mine:
 *   get:
 *     summary: List the signed-in diner's reservations
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get("/api/reservations/mine", dinerOnly, reservationController.listMine);

/**
 * @openapi
 * /api/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel the signed-in diner's own reservation
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cancelled }
 *       404: { description: Not found or not yours }
 *       409: { description: This reservation can no longer be cancelled }
 */
reservationsRouter.patch(
  "/api/reservations/:id/cancel",
  dinerOnly,
  reservationController.cancelMine,
);

/**
 * @openapi
 * /api/reservations/manual:
 *   post:
 *     summary: Record a walk-in/phone booking for one of the owner's restaurants
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
reservationsRouter.post(
  "/api/reservations/manual",
  ownerOnly,
  validateBody(createManualReservationSchema),
  reservationController.createManual,
);

/**
 * @openapi
 * /api/reservations:
 *   get:
 *     summary: List reservations across the signed-in owner's restaurants
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED, NO_SHOW] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get(
  "/api/reservations",
  ownerOnly,
  validateQuery(listReservationsQuerySchema),
  reservationController.listForOwner,
);

/**
 * @openapi
 * /api/reservations/{id}/status:
 *   patch:
 *     summary: Update a reservation's status (owner of the restaurant only)
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED, NO_SHOW]
 *     responses:
 *       200: { description: Updated }
 */
reservationsRouter.patch(
  "/api/reservations/:id/status",
  ownerOnly,
  validateBody(updateReservationStatusSchema),
  reservationController.updateStatus,
);

/**
 * @openapi
 * /api/reservations/all:
 *   get:
 *     summary: Platform-wide reservation oversight, read-only (admin only)
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED, NO_SHOW] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get(
  "/api/reservations/all",
  adminOnly,
  validateQuery(listReservationsQuerySchema),
  reservationController.listForAdmin,
);

/**
 * @openapi
 * /api/reservations/stats:
 *   get:
 *     summary: Daily booking counts across the signed-in owner's restaurants
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 14 }
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get(
  "/api/reservations/stats",
  ownerOnly,
  validateQuery(bookingStatsQuerySchema),
  reservationController.statsForOwner,
);

/**
 * @openapi
 * /api/reservations/stats/all:
 *   get:
 *     summary: Platform-wide daily booking counts (admin only)
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 14 }
 *     responses:
 *       200: { description: OK }
 */
reservationsRouter.get(
  "/api/reservations/stats/all",
  adminOnly,
  validateQuery(bookingStatsQuerySchema),
  reservationController.statsForAdmin,
);

/**
 * @openapi
 * /api/reservations/{id}/payment:
 *   get:
 *     summary: Get the deposit payment for the signed-in diner's reservation
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   post:
 *     summary: Create (or fetch the existing) KHQR deposit payment for a reservation
 *     description: >
 *       No real payment gateway is integrated in this scaffold — the
 *       `khqrPayload` is a deterministic placeholder string for the QR code
 *       to render, not a valid EMV-KHQR payload.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       400: { description: This reservation has no deposit due }
 *       404: { description: Not found }
 */
reservationsRouter.get("/api/reservations/:id/payment", dinerOnly, paymentController.get);
reservationsRouter.post("/api/reservations/:id/payment", dinerOnly, paymentController.create);

/**
 * @openapi
 * /api/reservations/{id}/payment/confirm:
 *   post:
 *     summary: Dev-simulated "I've paid" confirmation for a KHQR deposit
 *     description: >
 *       Simulates the customer completing payment (no real gateway callback
 *       exists yet) — marks the deposit paid and, if the reservation was
 *       still pending, confirms it.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Confirmed }
 *       404: { description: No payment found for this reservation }
 */
reservationsRouter.post(
  "/api/reservations/:id/payment/confirm",
  dinerOnly,
  paymentController.confirm,
);
