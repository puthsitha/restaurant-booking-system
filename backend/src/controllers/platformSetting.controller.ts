import type { NextFunction, Request, Response } from "express";

import * as platformSettingService from "../services/platformSetting.service";
import type { UpdatePlatformSettingsInput } from "../schemas/platformSetting.schemas";

export async function get(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await platformSettingService.getSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request<unknown, unknown, UpdatePlatformSettingsInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = await platformSettingService.updateSettings(req.body);
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}
