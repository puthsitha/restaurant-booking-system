import type { NextFunction, Request, Response } from "express";

import * as tagService from "../services/tag.service";
import type { CreateTagInput } from "../schemas/tag.schemas";

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagService.listTags();
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<unknown, unknown, CreateTagInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json({ tag });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await tagService.deleteTag(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
