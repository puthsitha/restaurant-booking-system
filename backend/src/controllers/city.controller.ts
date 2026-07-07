import type { NextFunction, Request, Response } from "express";

import { getRequestLocale } from "../lib/locale";
import * as cityService from "../services/city.service";
import type { CreateCityInput, UpdateCityInput } from "../schemas/city.schemas";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cities = await cityService.listCities(getRequestLocale(req));
    res.json({ cities });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<unknown, unknown, CreateCityInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const city = await cityService.createCity(req.body);
    res.status(201).json({ city });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request<{ id: string }, unknown, UpdateCityInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const city = await cityService.updateCity(req.params.id, req.body);
    res.json({ city });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cityService.deleteCity(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
