import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as reviewService from "../services/review.service";
import type { CreateReviewInput, ReplyToReviewInput } from "../schemas/review.schemas";

function requireUser(req: { user?: Request["user"] }): NonNullable<Request["user"]> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.user;
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await reviewService.listReviews(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request<{ id: string }, unknown, CreateReviewInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const review = await reviewService.createReview(requireUser(req).id, req.params.id, req.body);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function reply(
  req: Request<{ id: string }, unknown, ReplyToReviewInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const review = await reviewService.replyToReview(requireUser(req).id, req.params.id, req.body);
    res.json({ review });
  } catch (err) {
    next(err);
  }
}
