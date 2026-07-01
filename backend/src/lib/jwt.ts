import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

import { env } from "../env";
import { HttpError } from "./httpError";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

// Verifies a bearer token and narrows jsonwebtoken's loosely-typed payload
// down to the shape we actually sign, throwing rather than trusting shape.
export function verifyAuthToken(token: string): AuthTokenPayload {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.role !== "string"
  ) {
    throw new HttpError(401, "Invalid or expired token");
  }

  return { sub: decoded.sub, role: decoded.role as Role };
}
