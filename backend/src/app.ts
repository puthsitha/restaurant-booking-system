import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi, { type SwaggerUiOptions } from "swagger-ui-express";

import { buildSwaggerDevAuthScript } from "./docs/devAuth";
import { openapiSpec } from "./docs/openapi";
import { env } from "./env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";
import { paymentMethodsRouter } from "./routes/paymentMethods";
import { requestsRouter } from "./routes/requests";
import { reservationsRouter } from "./routes/reservations";
import { restaurantsRouter } from "./routes/restaurants";
import { savedRestaurantsRouter } from "./routes/savedRestaurants";
import { tagsRouter } from "./routes/tags";
import { usersRouter } from "./routes/users";

// helmet's default script-src ('self') blocks the inline dev-login script
// below, which swagger-ui-express injects as a plain <script> tag with no
// nonce support. Relax it for /docs only, and only outside production,
// rather than weakening CSP for the whole API.
function relaxDocsCspForDevAuth(_req: Request, res: Response, next: NextFunction): void {
  if (!env.isProduction) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:",
    );
  }
  next();
}

// @types/swagger-ui-express@4.1.8 hasn't caught up with swagger-ui-express@5's
// `customJsStr` option, which the runtime does support (renders as a plain
// inline <script> tag). Extend the type rather than casting to `any`.
type SwaggerUiOptionsWithCustomJsStr = SwaggerUiOptions & { customJsStr?: string };

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
  app.use(restaurantsRouter);
  app.use(reservationsRouter);
  app.use(requestsRouter);
  app.use(usersRouter);
  app.use(tagsRouter);
  app.use(savedRestaurantsRouter);
  app.use(paymentMethodsRouter);

  // Interactive API docs, generated from @openapi JSDoc comments on the
  // routes. Outside production, adds "log in as ..." buttons that call
  // preauthorizeApiKey so testing protected endpoints needs no manual
  // token copy-paste (see docs/devAuth.ts).
  const swaggerSetupOptions: SwaggerUiOptionsWithCustomJsStr = {
    customJsStr: env.isProduction ? undefined : buildSwaggerDevAuthScript(),
  };
  app.use(
    "/docs",
    relaxDocsCspForDevAuth,
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, swaggerSetupOptions),
  );

  // 404 + centralized error handling must be registered last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
