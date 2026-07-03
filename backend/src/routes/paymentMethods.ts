import { Router } from "express";

import * as paymentMethodController from "../controllers/paymentMethod.controller";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createPaymentMethodSchema } from "../schemas/paymentMethod.schemas";

export const paymentMethodsRouter: Router = Router();

/**
 * @openapi
 * /api/payment-methods:
 *   get:
 *     summary: List the signed-in user's saved payment methods
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Add a payment method
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [brand, label]
 *             properties:
 *               brand: { type: string, enum: [ABA, WING, BAKONG, ACLEDA] }
 *               label: { type: string }
 *               detail: { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       201: { description: Created }
 */
paymentMethodsRouter.get("/api/payment-methods", authenticate, paymentMethodController.list);
paymentMethodsRouter.post(
  "/api/payment-methods",
  authenticate,
  validateBody(createPaymentMethodSchema),
  paymentMethodController.create,
);

/**
 * @openapi
 * /api/payment-methods/{id}:
 *   delete:
 *     summary: Remove a payment method
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
paymentMethodsRouter.delete(
  "/api/payment-methods/:id",
  authenticate,
  paymentMethodController.remove,
);

/**
 * @openapi
 * /api/payment-methods/{id}/default:
 *   patch:
 *     summary: Mark a payment method as the default
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
paymentMethodsRouter.patch(
  "/api/payment-methods/:id/default",
  authenticate,
  paymentMethodController.setDefault,
);
