import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as restaurantService from "../services/restaurant.service";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
  UpdateRestaurantStatusInput,
  ListRestaurantsQuery,
  AdminListRestaurantsQuery,
  SetOperatingHoursInput,
  CreateTableInput,
  UpdateTableInput,
  CreateMenuInput,
  UpdateMenuInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  CreateSpecialClosureInput,
  SetRestaurantTagsInput,
} from "../schemas/restaurant.schemas";

// Every handler assumes authenticate/requireRole already populated req.user
// where required; TypeScript can't see that across middleware boundaries, so
// handlers that need it read it through this small helper instead of `!`.
// Typed structurally (not as the full generic Request<...>) so it accepts
// any of the differently-parameterized Request<> types used below.
function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function create(
  req: Request<unknown, unknown, CreateRestaurantInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const restaurant = await restaurantService.createRestaurant(user.id, req.body);
    res.status(201).json({ restaurant });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as ListRestaurantsQuery;
    const result = await restaurantService.listRestaurants(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as AdminListRestaurantsQuery;
    const result = await restaurantService.listAllRestaurantsForAdmin(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const restaurants = await restaurantService.listMyRestaurants(user.id);
    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await restaurantService.getPublicRestaurantBySlug(req.params.slug);
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const restaurant = await restaurantService.getManagementRestaurant(req.params.id, user);
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request<{ id: string }, unknown, UpdateRestaurantInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const restaurant = await restaurantService.updateRestaurant(
      req.params.id,
      user.id,
      req.body,
    );
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request<{ id: string }, unknown, UpdateRestaurantStatusInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const restaurant = await restaurantService.updateRestaurantStatus(
      req.params.id,
      req.body,
    );
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

export async function setHours(
  req: Request<{ id: string }, unknown, SetOperatingHoursInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const hours = await restaurantService.setOperatingHours(req.params.id, user.id, req.body);
    res.json({ hours });
  } catch (err) {
    next(err);
  }
}

export async function listTables(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    const tables = await restaurantService.listTables(req.params.id, user.id);
    res.json({ tables });
  } catch (err) {
    next(err);
  }
}

export async function createTable(
  req: Request<{ id: string }, unknown, CreateTableInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const table = await restaurantService.createTable(req.params.id, user.id, req.body);
    res.status(201).json({ table });
  } catch (err) {
    next(err);
  }
}

export async function updateTable(
  req: Request<{ id: string; tableId: string }, unknown, UpdateTableInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const table = await restaurantService.updateTable(
      req.params.id,
      user.id,
      req.params.tableId,
      req.body,
    );
    res.json({ table });
  } catch (err) {
    next(err);
  }
}

export async function deleteTable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    await restaurantService.deleteTable(req.params.id, user.id, req.params.tableId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createMenu(
  req: Request<{ id: string }, unknown, CreateMenuInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const menu = await restaurantService.createMenu(req.params.id, user.id, req.body);
    res.status(201).json({ menu });
  } catch (err) {
    next(err);
  }
}

export async function updateMenu(
  req: Request<{ id: string; menuId: string }, unknown, UpdateMenuInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const menu = await restaurantService.updateMenu(
      req.params.id,
      user.id,
      req.params.menuId,
      req.body,
    );
    res.json({ menu });
  } catch (err) {
    next(err);
  }
}

export async function deleteMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = requireUser(req);
    await restaurantService.deleteMenu(req.params.id, user.id, req.params.menuId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createMenuItem(
  req: Request<{ id: string; menuId: string }, unknown, CreateMenuItemInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const item = await restaurantService.createMenuItem(
      req.params.id,
      user.id,
      req.params.menuId,
      req.body,
    );
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function updateMenuItem(
  req: Request<{ id: string; menuId: string; itemId: string }, unknown, UpdateMenuItemInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const item = await restaurantService.updateMenuItem(
      req.params.id,
      user.id,
      req.params.menuId,
      req.params.itemId,
      req.body,
    );
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function deleteMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    await restaurantService.deleteMenuItem(
      req.params.id,
      user.id,
      req.params.menuId,
      req.params.itemId,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createGalleryImage(
  req: Request<{ id: string }, unknown, CreateGalleryImageInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const image = await restaurantService.createGalleryImage(req.params.id, user.id, req.body);
    res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryImage(
  req: Request<{ id: string; imageId: string }, unknown, UpdateGalleryImageInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const image = await restaurantService.updateGalleryImage(
      req.params.id,
      user.id,
      req.params.imageId,
      req.body,
    );
    res.json({ image });
  } catch (err) {
    next(err);
  }
}

export async function deleteGalleryImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    await restaurantService.deleteGalleryImage(req.params.id, user.id, req.params.imageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createSpecialClosure(
  req: Request<{ id: string }, unknown, CreateSpecialClosureInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const closure = await restaurantService.createSpecialClosure(
      req.params.id,
      user.id,
      req.body,
    );
    res.status(201).json({ closure });
  } catch (err) {
    next(err);
  }
}

export async function deleteSpecialClosure(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    await restaurantService.deleteSpecialClosure(req.params.id, user.id, req.params.closureId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function setTags(
  req: Request<{ id: string }, unknown, SetRestaurantTagsInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = requireUser(req);
    const restaurant = await restaurantService.setRestaurantTags(
      req.params.id,
      user.id,
      req.body,
    );
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}
