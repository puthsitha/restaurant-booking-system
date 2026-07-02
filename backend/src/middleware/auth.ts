import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";

import { HttpError } from "../lib/httpError";
import { verifyAuthToken } from "../lib/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

const BEARER_PREFIX = "Bearer ";

// Verifies the Authorization header and attaches the authenticated user's id
// and role to the request. Routes that need a signed-in user place this
// before their handler.
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new HttpError(401, "Missing bearer token"));
    return;
  }

  const payload = verifyAuthToken(header.slice(BEARER_PREFIX.length));
  req.user = { id: payload.sub, role: payload.role };
  next();
}

// Like authenticate, but a missing/invalid token is not an error — it just
// leaves req.user unset. Used by endpoints that behave differently for
// signed-in vs. anonymous callers (e.g. a restaurant detail page that's
// public when ACTIVE but visible to its owner/an admin regardless of status).
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    next();
    return;
  }

  try {
    const payload = verifyAuthToken(header.slice(BEARER_PREFIX.length));
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Ignore an invalid/expired token here; the route treats this request
    // as anonymous rather than failing it.
  }
  next();
}

// Restricts a route to one of the given roles. Must run after authenticate.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, "Not authenticated"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, "You don't have permission to do that"));
      return;
    }
    next();
  };
}
