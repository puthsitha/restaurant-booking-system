import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { openapiSpec } from "./docs/openapi";
import { env } from "./env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";

// Build the Express application. Kept separate from server startup so tests can
// exercise the app without binding a port.
export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (e.g. a load balancer) so client IPs used for
  // rate limiting and logging are accurate. Increase if behind more proxies.
  app.set("trust proxy", 1);

  // Security response headers (nosniff, frameguard, HSTS, CSP, ...). Also
  // removes the X-Powered-By header that advertises Express.
  app.use(helmet());

  // Restrict cross-origin browser access to an explicit allowlist of origins
  // rather than reflecting every origin.
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );

  // Reject oversized JSON bodies to blunt memory-exhaustion payloads.
  app.use(express.json({ limit: env.jsonBodyLimit }));

  // Basic abuse protection: cap requests per client IP per window.
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      limit: env.rateLimit.max,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );

  app.use(healthRouter);
  app.use(authRouter);

  // Interactive API docs, generated from @openapi JSDoc comments on the routes.
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // 404 + centralized error handling must be registered last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
