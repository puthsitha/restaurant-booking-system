import { Router } from "express";

import * as tagController from "../controllers/tag.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createTagSchema, updateTagSchema } from "../schemas/tag.schemas";

export const tagsRouter: Router = Router();

const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: List all tags (public)
 *     tags: [Tags]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create a tag (admin only)
 *     tags: [Tags]
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
 *     responses:
 *       201: { description: Created }
 *       409: { description: Tag already exists }
 */
tagsRouter.get("/api/tags", tagController.list);
tagsRouter.post("/api/tags", adminOnly, validateBody(createTagSchema), tagController.create);

/**
 * @openapi
 * /api/tags/{id}:
 *   patch:
 *     summary: Update a tag, e.g. to add its Khmer name (admin only)
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               nameKm: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   delete:
 *     summary: Delete a tag (admin only)
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
tagsRouter.patch("/api/tags/:id", adminOnly, validateBody(updateTagSchema), tagController.update);
tagsRouter.delete("/api/tags/:id", adminOnly, tagController.remove);
