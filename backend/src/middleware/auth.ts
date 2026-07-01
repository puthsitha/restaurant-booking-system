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
