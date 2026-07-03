import { Router } from "express";

import * as reviewController from "../controllers/review.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createReviewSchema, replyToReviewSchema, updateReviewSchema } from "../schemas/review.schemas";

export const reviewsRouter: Router = Router();

/**
 * @openapi
 * /api/restaurants/{id}/reviews:
 *   get:
 *     summary: List a restaurant's reviews with a rating distribution (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Leave a review for a restaurant (diner, one per restaurant)
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               text: { type: string }
 *     responses:
 *       201: { description: Created }
 *       404: { description: Restaurant not found }
 *       409: { description: Already reviewed }
 */
reviewsRouter.get("/api/restaurants/:id/reviews", reviewController.list);
reviewsRouter.post(
  "/api/restaurants/:id/reviews",
  authenticate,
  requireRole("DINER"),
  validateBody(createReviewSchema),
  reviewController.create,
);

/**
 * @openapi
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update the signed-in diner's own review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               text: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found or not yours }
 *   delete:
 *     summary: Delete the signed-in diner's own review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found or not yours }
 */
reviewsRouter.patch(
  "/api/reviews/:id",
  authenticate,
  requireRole("DINER"),
  validateBody(updateReviewSchema),
  reviewController.update,
);
reviewsRouter.delete(
  "/api/reviews/:id",
  authenticate,
  requireRole("DINER"),
  reviewController.remove,
);

/**
 * @openapi
 * /api/reviews/{id}/reply:
 *   patch:
 *     summary: Reply to a review (the restaurant's owner only)
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reply]
 *             properties:
 *               reply: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
reviewsRouter.patch(
  "/api/reviews/:id/reply",
  authenticate,
  requireRole("OWNER"),
  validateBody(replyToReviewSchema),
  reviewController.reply,
);
