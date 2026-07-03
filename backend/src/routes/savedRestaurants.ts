import { Router } from "express";

import * as savedRestaurantController from "../controllers/savedRestaurant.controller";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { saveRestaurantSchema } from "../schemas/savedRestaurant.schemas";

export const savedRestaurantsRouter: Router = Router();

/**
 * @openapi
 * /api/saved-restaurants:
 *   get:
 *     summary: List the signed-in user's saved restaurants
 *     tags: [SavedRestaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Save a restaurant (idempotent)
 *     tags: [SavedRestaurants]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurantId]
 *             properties:
 *               restaurantId: { type: string }
 *     responses:
 *       201: { description: Saved }
 *       404: { description: Restaurant not found }
 */
savedRestaurantsRouter.get("/api/saved-restaurants", authenticate, savedRestaurantController.list);
savedRestaurantsRouter.post(
  "/api/saved-restaurants",
  authenticate,
  validateBody(saveRestaurantSchema),
  savedRestaurantController.save,
);

/**
 * @openapi
 * /api/saved-restaurants/{restaurantId}:
 *   delete:
 *     summary: Unsave a restaurant
 *     tags: [SavedRestaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
savedRestaurantsRouter.delete(
  "/api/saved-restaurants/:restaurantId",
  authenticate,
  savedRestaurantController.unsave,
);
