import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as savedRestaurantService from "../services/savedRestaurant.service";
import type { SaveRestaurantInput } from "../schemas/savedRestaurant.schemas";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const savedRestaurants = await savedRestaurantService.listSavedRestaurants(requireUser(req).id);
    res.json({ savedRestaurants });
  } catch (err) {
    next(err);
  }
}

export async function save(
  req: Request<unknown, unknown, SaveRestaurantInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const savedRestaurant = await savedRestaurantService.saveRestaurant(
      requireUser(req).id,
      req.body.restaurantId,
    );
    res.status(201).json({ savedRestaurant });
  } catch (err) {
    next(err);
  }
}

export async function unsave(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await savedRestaurantService.unsaveRestaurant(requireUser(req).id, req.params.restaurantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
