import type { NextFunction, Request, Response } from "express";

import { env } from "../env";

interface HttpError {
  status?: number;
  message?: string;
}

// Catch-all for unmatched routes. Registered after every real route.
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not Found" });
}

// Centralized error handler. Express identifies it as error middleware by its
// four-argument signature, so `next` must stay even though it is unused.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the full error server-side for debugging...
  // eslint-disable-next-line no-console
  console.error(err);

  const httpError = err as HttpError;
  const status =
    typeof httpError?.status === "number" ? httpError.status : 500;

  // ...but never leak stack traces or internal messages to clients in prod.
  const message =
    env.isProduction || status >= 500
      ? "Internal Server Error"
      : (httpError.message ?? "Error");

  res.status(status).json({ error: message });
}
