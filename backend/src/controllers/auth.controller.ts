import crypto from "node:crypto";
import { Request, Response } from "express";
import { z } from "zod";
import env from "../configs/env";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { createAuthToken, AuthTokenPayload } from "../utils/auth-token";
import { AsyncHandler } from "../utils/async-handler";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    maxAge: env.AUTH_TOKEN_TTL_SECONDS * 1000,
    path: "/"
  };
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export const loginAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw ApiError.validation("Invalid login payload", result.error.flatten());
  }

  const emailMatches = safeCompare(result.data.email, env.ADMIN_EMAIL);
  const passwordMatches = safeCompare(result.data.password, env.ADMIN_PASSWORD);

  if (!emailMatches || !passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  res.cookie(
    env.AUTH_COOKIE_NAME,
    createAuthToken(env.ADMIN_EMAIL),
    authCookieOptions()
  );

  return ApiResponse.ok(res, "Logged in", {
    email: env.ADMIN_EMAIL
  });
});

export const logoutAdmin = AsyncHandler(
  async (_req: Request, res: Response) => {
    res.clearCookie(env.AUTH_COOKIE_NAME, {
      ...authCookieOptions(),
      maxAge: undefined
    });

    return ApiResponse.ok(res, "Logged out", null);
  }
);

export const getAdminMe = AsyncHandler(async (_req: Request, res: Response) => {
  const admin = res.locals.admin as AuthTokenPayload | undefined;

  if (!admin) {
    throw ApiError.unauthorized("Admin authentication required");
  }

  return ApiResponse.ok(res, "Admin fetched", {
    email: admin.email
  });
});
