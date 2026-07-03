import { Router } from "express";

import * as restaurantController from "../controllers/restaurant.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateRestaurantStatusSchema,
  listRestaurantsQuerySchema,
  adminListRestaurantsQuerySchema,
  listMyRestaurantsQuerySchema,
  setOperatingHoursSchema,
  createTableSchema,
  updateTableSchema,
  createMenuSchema,
  updateMenuSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createGalleryImageSchema,
  updateGalleryImageSchema,
  createSpecialClosureSchema,
  setRestaurantTagsSchema,
} from "../schemas/restaurant.schemas";

export const restaurantsRouter: Router = Router();

const ownerOnly = [authenticate, requireRole("OWNER")];
const adminOnly = [authenticate, requireRole("ADMIN")];

/**
 * @openapi
 * /api/restaurants:
 *   get:
 *     summary: Search active restaurants (public)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: cuisineType
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: priceRange
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
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
 *       200:
 *         description: Paginated list of active restaurants
 *   post:
 *     summary: Create a restaurant (owner)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       403: { description: Restaurant limit reached }
 *       409: { description: Slug already taken }
 */
restaurantsRouter.get(
  "/api/restaurants",
  validateQuery(listRestaurantsQuerySchema),
  restaurantController.list,
);
restaurantsRouter.post(
  "/api/restaurants",
  ownerOnly,
  validateBody(createRestaurantSchema),
  restaurantController.create,
);

/**
 * @openapi
 * /api/restaurants/mine:
 *   get:
 *     summary: List the signed-in owner's restaurants (any status), paginated
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACTIVE, DISABLED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
restaurantsRouter.get(
  "/api/restaurants/mine",
  ownerOnly,
  validateQuery(listMyRestaurantsQuerySchema),
  restaurantController.listMine,
);

/**
 * @openapi
 * /api/restaurants/all:
 *   get:
 *     summary: List every restaurant regardless of status (admin only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACTIVE, DISABLED] }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: cuisineType
 *         schema: { type: string }
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
restaurantsRouter.get(
  "/api/restaurants/all",
  adminOnly,
  validateQuery(adminListRestaurantsQuerySchema),
  restaurantController.listAll,
);

/**
 * @openapi
 * /api/restaurants/slug/{slug}:
 *   get:
 *     summary: Get a restaurant's public detail page by slug
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found or not active }
 */
restaurantsRouter.get("/api/restaurants/slug/:slug", restaurantController.getBySlug);

/**
 * @openapi
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get full management detail (owner of the restaurant, or admin)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found or not yours }
 *   patch:
 *     summary: Update a restaurant's profile (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
restaurantsRouter.get("/api/restaurants/:id", authenticate, restaurantController.getById);
restaurantsRouter.patch(
  "/api/restaurants/:id",
  ownerOnly,
  validateBody(updateRestaurantSchema),
  restaurantController.update,
);

/**
 * @openapi
 * /api/restaurants/{id}/status:
 *   patch:
 *     summary: >
 *       Approve/reject a pending restaurant, or suspend/reactivate an
 *       existing one (admin only, any restaurant). A reason is always
 *       required and shown back to the owner.
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, reason]
 *             properties:
 *               status: { type: string, enum: [ACTIVE, DISABLED] }
 *               reason: { type: string, description: "Shown to the restaurant's owner." }
 *     responses:
 *       200: { description: Updated }
 */
restaurantsRouter.patch(
  "/api/restaurants/:id/status",
  adminOnly,
  validateBody(updateRestaurantStatusSchema),
  restaurantController.updateStatus,
);

/**
 * @openapi
 * /api/restaurants/{id}/hours:
 *   put:
 *     summary: Replace a restaurant's weekly operating hours (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Replaced }
 */
restaurantsRouter.put(
  "/api/restaurants/:id/hours",
  ownerOnly,
  validateBody(setOperatingHoursSchema),
  restaurantController.setHours,
);

/**
 * @openapi
 * /api/restaurants/{id}/tables:
 *   get:
 *     summary: List a restaurant's tables (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Add a table (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
restaurantsRouter.get(
  "/api/restaurants/:id/tables",
  ownerOnly,
  restaurantController.listTables,
);
restaurantsRouter.post(
  "/api/restaurants/:id/tables",
  ownerOnly,
  validateBody(createTableSchema),
  restaurantController.createTable,
);

/**
 * @openapi
 * /api/restaurants/{id}/tables/{tableId}:
 *   patch:
 *     summary: Update a table (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Delete a table (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
restaurantsRouter.patch(
  "/api/restaurants/:id/tables/:tableId",
  ownerOnly,
  validateBody(updateTableSchema),
  restaurantController.updateTable,
);
restaurantsRouter.delete(
  "/api/restaurants/:id/tables/:tableId",
  ownerOnly,
  restaurantController.deleteTable,
);

/**
 * @openapi
 * /api/restaurants/{id}/menus:
 *   post:
 *     summary: Create a menu (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
restaurantsRouter.post(
  "/api/restaurants/:id/menus",
  ownerOnly,
  validateBody(createMenuSchema),
  restaurantController.createMenu,
);

/**
 * @openapi
 * /api/restaurants/{id}/menus/{menuId}:
 *   patch:
 *     summary: Update a menu (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Delete a menu and its items (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
restaurantsRouter.patch(
  "/api/restaurants/:id/menus/:menuId",
  ownerOnly,
  validateBody(updateMenuSchema),
  restaurantController.updateMenu,
);
restaurantsRouter.delete(
  "/api/restaurants/:id/menus/:menuId",
  ownerOnly,
  restaurantController.deleteMenu,
);

/**
 * @openapi
 * /api/restaurants/{id}/menus/{menuId}/items:
 *   post:
 *     summary: Add a menu item (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
restaurantsRouter.post(
  "/api/restaurants/:id/menus/:menuId/items",
  ownerOnly,
  validateBody(createMenuItemSchema),
  restaurantController.createMenuItem,
);

/**
 * @openapi
 * /api/restaurants/{id}/menus/{menuId}/items/{itemId}:
 *   patch:
 *     summary: Update a menu item (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Delete a menu item (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
restaurantsRouter.patch(
  "/api/restaurants/:id/menus/:menuId/items/:itemId",
  ownerOnly,
  validateBody(updateMenuItemSchema),
  restaurantController.updateMenuItem,
);
restaurantsRouter.delete(
  "/api/restaurants/:id/menus/:menuId/items/:itemId",
  ownerOnly,
  restaurantController.deleteMenuItem,
);

/**
 * @openapi
 * /api/restaurants/{id}/gallery:
 *   post:
 *     summary: Add a gallery image (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
restaurantsRouter.post(
  "/api/restaurants/:id/gallery",
  ownerOnly,
  validateBody(createGalleryImageSchema),
  restaurantController.createGalleryImage,
);

/**
 * @openapi
 * /api/restaurants/{id}/gallery/{imageId}:
 *   patch:
 *     summary: Update a gallery image (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Delete a gallery image (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
restaurantsRouter.patch(
  "/api/restaurants/:id/gallery/:imageId",
  ownerOnly,
  validateBody(updateGalleryImageSchema),
  restaurantController.updateGalleryImage,
);
restaurantsRouter.delete(
  "/api/restaurants/:id/gallery/:imageId",
  ownerOnly,
  restaurantController.deleteGalleryImage,
);

/**
 * @openapi
 * /api/restaurants/{id}/closures:
 *   post:
 *     summary: Mark a special closure date (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
restaurantsRouter.post(
  "/api/restaurants/:id/closures",
  ownerOnly,
  validateBody(createSpecialClosureSchema),
  restaurantController.createSpecialClosure,
);

/**
 * @openapi
 * /api/restaurants/{id}/closures/{closureId}:
 *   delete:
 *     summary: Remove a special closure date (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
restaurantsRouter.delete(
  "/api/restaurants/:id/closures/:closureId",
  ownerOnly,
  restaurantController.deleteSpecialClosure,
);

/**
 * @openapi
 * /api/restaurants/{id}/tags:
 *   put:
 *     summary: Replace a restaurant's tag list (owner only)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagIds]
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200: { description: Replaced }
 */
restaurantsRouter.put(
  "/api/restaurants/:id/tags",
  ownerOnly,
  validateBody(setRestaurantTagsSchema),
  restaurantController.setTags,
);
