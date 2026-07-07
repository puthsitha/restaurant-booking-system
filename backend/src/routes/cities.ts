import { Router } from "express";

import * as cityController from "../controllers/city.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createCitySchema, updateCitySchema } from "../schemas/city.schemas";

export const citiesRouter: Router = Router();

const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/cities:
 *   get:
 *     summary: List all cities (public) — powers the owner's city dropdown
 *     tags: [Cities]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create a city (admin only)
 *     tags: [Cities]
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
 *               imageUrl: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: City already exists }
 */
citiesRouter.get("/api/cities", cityController.list);
citiesRouter.post(
  "/api/cities",
  adminOnly,
  validateBody(createCitySchema),
  cityController.create,
);

/**
 * @openapi
 * /api/cities/{id}:
 *   patch:
 *     summary: Update a city (admin only)
 *     tags: [Cities]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   delete:
 *     summary: Delete a city (admin only) — rejected while any restaurant still uses it
 *     tags: [Cities]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 *       409: { description: Still assigned to a restaurant }
 */
citiesRouter.patch(
  "/api/cities/:id",
  adminOnly,
  validateBody(updateCitySchema),
  cityController.update,
);
citiesRouter.delete("/api/cities/:id", adminOnly, cityController.remove);
