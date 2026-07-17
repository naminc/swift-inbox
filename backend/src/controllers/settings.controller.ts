import { Request, Response } from "express";
import {
  getPublicSettings,
  getSettings,
  updateSettings
} from "../services/settings.service";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { updateSettingsSchema } from "../validators/settings.validators";

export const getPublicAppSettings = AsyncHandler(
  async (_req: Request, res: Response) => {
    return ApiResponse.ok(
      res,
      "Public settings fetched",
      await getPublicSettings()
    );
  }
);

export const getAppSettings = AsyncHandler(
  async (_req: Request, res: Response) => {
    return ApiResponse.ok(res, "Settings fetched", await getSettings());
  }
);

export const patchAppSettings = AsyncHandler(
  async (req: Request, res: Response) => {
    const result = updateSettingsSchema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.validation(
        "Invalid settings payload",
        result.error.flatten()
      );
    }

    return ApiResponse.ok(
      res,
      "Settings updated",
      await updateSettings(result.data)
    );
  }
);
