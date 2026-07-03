import { Router } from "express";

import * as platformSettingController from "../controllers/platformSetting.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updatePlatformSettingsSchema } from "../schemas/platformSetting.schemas";

export const platformSettingsRouter: Router = Router();

const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: Get platform-wide settings (admin only)
 *     tags: [Settings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   patch:
 *     summary: Update platform-wide settings (admin only)
 *     tags: [Settings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultRestaurantLimit: { type: integer }
 *               autoApproveOwners: { type: boolean }
 *               requireKhqrDeposits: { type: boolean }
 *               platformFeePerBooking: { type: number }
 *     responses:
 *       200: { description: Updated }
 */
platformSettingsRouter.get("/api/settings", adminOnly, platformSettingController.get);
platformSettingsRouter.patch(
  "/api/settings",
  adminOnly,
  validateBody(updatePlatformSettingsSchema),
  platformSettingController.update,
);
