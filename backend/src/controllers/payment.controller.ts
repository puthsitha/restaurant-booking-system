import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as paymentService from "../services/payment.service";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await paymentService.getPayment(requireUser(req).id, req.params.id);
    res.json({ payment });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await paymentService.getOrCreatePayment(requireUser(req).id, req.params.id);
    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await paymentService.confirmPayment(requireUser(req).id, req.params.id);
    res.json({ payment });
  } catch (err) {
    next(err);
  }
}
