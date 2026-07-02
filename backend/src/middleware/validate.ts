import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { HttpError } from "../lib/httpError";

// Parses and replaces req.body with the schema's validated (and typed) output,
// or forwards a 400 listing every validation issue.
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      next(new HttpError(400, message));
      return;
    }
    req.body = result.data;
    next();
  };
}

// Parses req.query and stashes the typed result on res.locals.query, since
// Express's ParsedQs type can't be reassigned to an arbitrary validated
// shape the way req.body can. Controllers read it back with a single cast:
// `res.locals.query as MyQueryType`.
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "query"}: ${issue.message}`)
        .join("; ");
      next(new HttpError(400, message));
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
