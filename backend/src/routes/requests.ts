import { Router } from "express";

import * as requestController from "../controllers/request.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createRestaurantRequestSchema,
  reviewRestaurantRequestSchema,
  listRestaurantRequestsQuerySchema,
} from "../schemas/request.schemas";

export const requestsRouter: Router = Router();

const ownerOnly = [authenticate, requireRole("OWNER")];
const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/restaurant-requests:
 *   post:
 *     summary: Ask for a higher restaurant limit (owner)
 *     tags: [RestaurantRequests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestedCount, reason]
 *             properties:
 *               requestedCount: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Requested count is not above the current limit }
 *       409: { description: A pending request already exists }
 */
requestsRouter.post(
  "/api/restaurant-requests",
  ownerOnly,
  validateBody(createRestaurantRequestSchema),
  requestController.create,
);

/**
 * @openapi
 * /api/restaurant-requests/mine:
 *   get:
 *     summary: List the signed-in owner's own requests
 *     tags: [RestaurantRequests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
requestsRouter.get("/api/restaurant-requests/mine", ownerOnly, requestController.listMine);

/**
 * @openapi
 * /api/restaurant-requests:
 *   get:
 *     summary: List every restaurant-limit request (admin only)
 *     tags: [RestaurantRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, DENIED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
requestsRouter.get(
  "/api/restaurant-requests",
  adminOnly,
  validateQuery(listRestaurantRequestsQuerySchema),
  requestController.listAll,
);

/**
 * @openapi
 * /api/restaurant-requests/{id}/review:
 *   patch:
 *     summary: Approve or deny a request, with a required reason (admin only)
 *     tags: [RestaurantRequests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, reviewNote]
 *             properties:
 *               status: { type: string, enum: [APPROVED, DENIED] }
 *               reviewNote: { type: string }
 *     responses:
 *       200: { description: Reviewed }
 *       409: { description: This request has already been reviewed }
 */
requestsRouter.patch(
  "/api/restaurant-requests/:id/review",
  adminOnly,
  validateBody(reviewRestaurantRequestSchema),
  requestController.review,
);
