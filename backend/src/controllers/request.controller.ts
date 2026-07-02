import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as requestService from "../services/request.service";
import type {
  CreateRestaurantRequestInput,
  ReviewRestaurantRequestInput,
  ListRestaurantRequestsQuery,
} from "../schemas/request.schemas";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function create(
  req: Request<unknown, unknown, CreateRestaurantRequestInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const request = await requestService.createRestaurantRequest(user.id, req.body);
    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const requests = await requestService.listMyRestaurantRequests(user.id);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as ListRestaurantRequestsQuery;
    const result = await requestService.listAllRestaurantRequests(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function review(
  req: Request<{ id: string }, unknown, ReviewRestaurantRequestInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const request = await requestService.reviewRestaurantRequest(req.params.id, user.id, req.body);
    res.json({ request });
  } catch (err) {
    next(err);
  }
}
