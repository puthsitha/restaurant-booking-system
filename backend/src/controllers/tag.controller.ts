import type { NextFunction, Request, Response } from "express";

import { getRequestLocale } from "../lib/locale";
import * as tagService from "../services/tag.service";
import type { CreateTagInput, UpdateTagInput } from "../schemas/tag.schemas";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagService.listTags(getRequestLocale(req));
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

export async function update(
  req: Request<{ id: string }, unknown, UpdateTagInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json({ tag });
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
