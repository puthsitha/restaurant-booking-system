import { Router } from "express";

import * as userController from "../controllers/user.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createOwnerSchema,
  listUsersQuerySchema,
  updateUserStatusSchema,
} from "../schemas/user.schemas";

export const usersRouter: Router = Router();

const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List diners and owners, filterable by role and searchable by name/phone (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [DINER, OWNER] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
usersRouter.get(
  "/api/users",
  adminOnly,
  validateQuery(listUsersQuerySchema),
  userController.list,
);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Provision a restaurant-owner account (admin only) — owners no longer self-register
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               restaurantLimit: { type: integer, default: 3 }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email already in use }
 */
usersRouter.post(
  "/api/users",
  adminOnly,
  validateBody(createOwnerSchema),
  userController.createOwner,
);

/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     summary: Suspend or reactivate a diner/owner account (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, reason]
 *             properties:
 *               status: { type: string, enum: [ACTIVE, SUSPENDED] }
 *               reason: { type: string, description: "Shown to the affected user." }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
usersRouter.patch(
  "/api/users/:id/status",
  adminOnly,
  validateBody(updateUserStatusSchema),
  userController.updateStatus,
);
