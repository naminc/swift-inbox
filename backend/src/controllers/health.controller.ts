import { Request, Response } from "express";
import { STATUS_CODES } from "../constants/status-codes";
import prisma from "../configs/prisma";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";

export const healthCheck = AsyncHandler(
  async (_req: Request, res: Response) => {
    let dbStatus = "healthy";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "unhealthy";
    }

    const status = dbStatus === "healthy" ? "healthy" : "degraded";
    const code =
      status === "healthy" ? STATUS_CODES.OK : STATUS_CODES.SERVICE_UNAVAILABLE;

    return ApiResponse.Success(
      res,
      `Service is ${status}`,
      {
        status,
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      code
    );
  }
);

export const detailedHealthCheck = AsyncHandler(
  async (_req: Request, res: Response) => {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        unit: "MB"
      },
      cpu: {
        usage: process.cpuUsage()
      }
    };

    return ApiResponse.Success(res, "Service is healthy", healthData);
  }
);
