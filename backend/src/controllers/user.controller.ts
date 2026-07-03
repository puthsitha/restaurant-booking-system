import type { NextFunction, Request, Response } from "express";

import * as userService from "../services/user.service";
import type {
  CreateOwnerInput,
  ListUsersQuery,
  UpdateRestaurantLimitInput,
  UpdateUserStatusInput,
} from "../schemas/user.schemas";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as ListUsersQuery;
    const result = await userService.listUsers(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createOwner(
  req: Request<unknown, unknown, CreateOwnerInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await userService.createOwner(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request<{ id: string }, unknown, UpdateUserStatusInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateRestaurantLimit(
  req: Request<{ id: string }, unknown, UpdateRestaurantLimitInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await userService.updateRestaurantLimit(req.params.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
