import { NextFunction, Request, Response } from "express";
import env from "../configs/env";
import { ApiError } from "../utils/api-error";
import { verifyAuthToken } from "../utils/auth-token";

type RequestWithCookies = Request & {
  cookies?: Record<string, string>;
};

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = (req as RequestWithCookies).cookies?.[env.AUTH_COOKIE_NAME];

  if (!token) {
    throw ApiError.unauthorized("Admin authentication required");
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    throw ApiError.unauthorized("Admin authentication required");
  }

  res.locals.admin = payload;
  next();
}
