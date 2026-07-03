import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as reservationService from "../services/reservation.service";
import type {
  CreateReservationInput,
  CreateManualReservationInput,
  UpdateReservationStatusInput,
  ListReservationsQuery,
  CheckAvailabilityQuery,
  BookingStatsQuery,
} from "../schemas/reservation.schemas";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as CheckAvailabilityQuery;
    const result = await reservationService.checkAvailability(req.params.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<unknown, unknown, CreateReservationInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const reservation = await reservationService.createReservation(user.id, req.body);
    res.status(201).json({ reservation });
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const reservations = await reservationService.listMyReservations(user.id);
    res.json({ reservations });
  } catch (err) {
    next(err);
  }
}

export async function cancelMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const reservation = await reservationService.cancelMyReservation(user.id, req.params.id);
    res.json({ reservation });
  } catch (err) {
    next(err);
  }
}

export async function createManual(
  req: Request<unknown, unknown, CreateManualReservationInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const reservation = await reservationService.createManualReservation(user.id, req.body);
    res.status(201).json({ reservation });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request<{ id: string }, unknown, UpdateReservationStatusInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const reservation = await reservationService.updateReservationStatus(
      req.params.id,
      user.id,
      req.body,
    );
    res.json({ reservation });
  } catch (err) {
    next(err);
  }
}

export async function listForOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const query = res.locals.query as ListReservationsQuery;
    const result = await reservationService.listOwnerReservations(user.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as ListReservationsQuery;
    const result = await reservationService.listAllReservationsForAdmin(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function statsForOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const query = res.locals.query as BookingStatsQuery;
    const days = await reservationService.bookingStatsForOwner(user.id, query);
    res.json({ days });
  } catch (err) {
    next(err);
  }
}

export async function statsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as BookingStatsQuery;
    const days = await reservationService.bookingStatsForAdmin(query);
    res.json({ days });
  } catch (err) {
    next(err);
  }
}
