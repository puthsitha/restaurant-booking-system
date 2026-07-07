import { Router } from "express";

import * as cuisineController from "../controllers/cuisine.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createCuisineSchema, updateCuisineSchema } from "../schemas/cuisine.schemas";

export const cuisinesRouter: Router = Router();

const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/cuisines:
 *   get:
 *     summary: List all cuisines (public) — powers the home page's browse-by-cuisine tiles and the owner's cuisine dropdown
 *     tags: [Cuisines]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create a cuisine (admin only)
 *     tags: [Cuisines]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               nameKm: { type: string }
 *               description: { type: string }
 *               descriptionKm: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Cuisine already exists }
 */
cuisinesRouter.get("/api/cuisines", cuisineController.list);
cuisinesRouter.post(
  "/api/cuisines",
  adminOnly,
  validateBody(createCuisineSchema),
  cuisineController.create,
);

/**
 * @openapi
 * /api/cuisines/{id}:
 *   patch:
 *     summary: Update a cuisine (admin only)
 *     tags: [Cuisines]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   delete:
 *     summary: Delete a cuisine (admin only) — rejected while any restaurant still uses it
 *     tags: [Cuisines]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 *       409: { description: Still assigned to a restaurant }
 */
cuisinesRouter.patch(
  "/api/cuisines/:id",
  adminOnly,
  validateBody(updateCuisineSchema),
  cuisineController.update,
);
cuisinesRouter.delete("/api/cuisines/:id", adminOnly, cuisineController.remove);
