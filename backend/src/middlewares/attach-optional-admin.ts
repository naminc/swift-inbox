import { NextFunction, Request, Response } from "express";
import env from "../configs/env";
import { verifyAuthToken } from "../utils/auth-token";

type RequestWithCookies = Request & {
  cookies?: Record<string, string>;
};

export function attachOptionalAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = (req as RequestWithCookies).cookies?.[env.AUTH_COOKIE_NAME];

  if (token) {
    const payload = verifyAuthToken(token);

    if (payload) {
      res.locals.admin = payload;
    }
  }

  next();
}
