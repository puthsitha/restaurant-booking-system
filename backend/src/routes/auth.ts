import { Router } from "express";

import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  signupSchema,
  loginSchema,
  googleAuthSchema,
  otpRequestSchema,
  otpVerifySchema,
  updateProfileSchema,
} from "../schemas/auth.schemas";

export const authRouter: Router = Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Create a diner account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post(
  "/api/auth/signup",
  validateBody(signupSchema),
  authController.signup,
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post(
  "/api/auth/login",
  validateBody(loginSchema),
  authController.login,
);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Log in or sign up with a Google ID token
 *     description: >
 *       Exchange a Google ID token (obtained client-side via Google Identity
 *       Services) for a TableSite session. Creates a new account on first
 *       login, or links to an existing account with the same email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       401:
 *         description: Invalid Google token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post(
  "/api/auth/google",
  validateBody(googleAuthSchema),
  authController.googleLogin,
);

/**
 * @openapi
 * /api/auth/otp/request:
 *   post:
 *     summary: Request a one-time login code for a Cambodian phone number
 *     description: >
 *       Sends a 6-digit code that expires in 5 minutes. No SMS provider is
 *       wired up yet, so outside production the response also includes
 *       `devCode` so the flow can be tested end-to-end without reading
 *       server logs.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+85512345678"
 *     responses:
 *       200:
 *         description: Code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 devCode:
 *                   type: string
 *                   description: Only present outside production.
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post(
  "/api/auth/otp/request",
  validateBody(otpRequestSchema),
  authController.otpRequest,
);

/**
 * @openapi
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verify a phone OTP code and log in (or sign up on first use)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, code]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+85512345678"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: No code was requested for this number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Invalid or expired code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       429:
 *         description: Too many attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post(
  "/api/auth/otp/verify",
  validateBody(otpVerifySchema),
  authController.otpVerify,
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the signed-in user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.get("/api/auth/me", authenticate, authController.me);

/**
 * @openapi
 * /api/auth/me:
 *   patch:
 *     summary: Update the signed-in user's profile (name, preferred locale)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               preferredLocale: { type: string, enum: [km, en] }
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Not authenticated
 */
authRouter.patch(
  "/api/auth/me",
  authenticate,
  validateBody(updateProfileSchema),
  authController.updateMe,
);
