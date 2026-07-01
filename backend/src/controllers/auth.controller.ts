import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/httpError";
import * as authService from "../services/auth.service";
import type {
  SignupInput,
  LoginInput,
  GoogleAuthInput,
} from "../schemas/auth.schemas";

export async function signup(
  req: Request<unknown, unknown, SignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(
  req: Request<unknown, unknown, GoogleAuthInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.loginWithGoogle(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
