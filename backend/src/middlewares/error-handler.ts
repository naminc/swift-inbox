import { Request, Response, NextFunction } from "express";
import env from "../configs/env";

import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  const logLine = `${message} | ${statusCode} | ${req.method} ${req.originalUrl}`;

  if (err instanceof ApiError && err.isOperational) {
    logger.warn(logLine);
  } else {
    logger.error(err, logLine);
  }

  const response = {
    success: false,
    message,
    statusCode,
    ...(errors !== undefined && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
