/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cku0z1a2b0000qzrmn831p1e5
 *         role:
 *           type: string
 *           enum: [DINER, OWNER, ADMIN]
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         googleId:
 *           type: string
 *           nullable: true
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED]
 *         preferredLocale:
 *           type: string
 *           example: km
 *         restaurantLimit:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: "#/components/schemas/User"
 *         token:
 *           type: string
 *           description: "JWT bearer token to send as: Authorization: Bearer <token>"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

// This module only exists to hold shared @openapi component definitions read
// by swagger-jsdoc; it has no runtime behavior.
export {};
