import crypto from "node:crypto";
import env from "../configs/env";

export type AuthTokenPayload = {
  email: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", env.AUTH_SECRET)
    .update(value)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createAuthToken(email: string) {
  const payload: AuthTokenPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + env.AUTH_TOKEN_TTL_SECONDS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  if (!safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload)
    ) as AuthTokenPayload;

    if (
      !payload.email ||
      !payload.exp ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
