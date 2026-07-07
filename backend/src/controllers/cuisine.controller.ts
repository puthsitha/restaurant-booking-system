import type { NextFunction, Request, Response } from "express";

import { getRequestLocale } from "../lib/locale";
import * as cuisineService from "../services/cuisine.service";
import type { CreateCuisineInput, UpdateCuisineInput } from "../schemas/cuisine.schemas";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cuisines = await cuisineService.listCuisines(getRequestLocale(req));
    res.json({ cuisines });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<unknown, unknown, CreateCuisineInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cuisine = await cuisineService.createCuisine(req.body);
    res.status(201).json({ cuisine });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request<{ id: string }, unknown, UpdateCuisineInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cuisine = await cuisineService.updateCuisine(req.params.id, req.body);
    res.json({ cuisine });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cuisineService.deleteCuisine(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
