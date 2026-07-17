import { Request, Response } from "express";
import {
  cleanupExpiredMailboxes,
  getCleanupStats
} from "../services/cleanup.service";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";

export const getCleanupStatsController = AsyncHandler(
  async (_req: Request, res: Response) => {
    return ApiResponse.ok(
      res,
      "Cleanup stats fetched",
      await getCleanupStats()
    );
  }
);

export const runCleanupController = AsyncHandler(
  async (_req: Request, res: Response) => {
    return ApiResponse.ok(
      res,
      "Cleanup completed",
      await cleanupExpiredMailboxes()
    );
  }
);
