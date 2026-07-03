import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as paymentMethodService from "../services/paymentMethod.service";
import type { CreatePaymentMethodInput } from "../schemas/paymentMethod.schemas";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentMethods = await paymentMethodService.listPaymentMethods(requireUser(req).id);
    res.json({ paymentMethods });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<unknown, unknown, CreatePaymentMethodInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const paymentMethod = await paymentMethodService.createPaymentMethod(
      requireUser(req).id,
      req.body,
    );
    res.status(201).json({ paymentMethod });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await paymentMethodService.deletePaymentMethod(requireUser(req).id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function setDefault(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentMethod = await paymentMethodService.setDefaultPaymentMethod(
      requireUser(req).id,
      req.params.id,
    );
    res.json({ paymentMethod });
  } catch (err) {
    next(err);
  }
}
