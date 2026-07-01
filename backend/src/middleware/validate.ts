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
