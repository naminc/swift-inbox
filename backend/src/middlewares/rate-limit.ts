import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/api-error";

function createLimiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: () => {
      throw ApiError.tooManyRequests(message);
    }
  });
}

export const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts, please try again later"
);

export const createMailboxLimiter = createLimiter(
  10 * 60 * 1000,
  30,
  "Too many mailbox creation requests, please try again later"
);

export const abuseLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  "Too many abuse reports, please try again later"
);

export const inboundLimiter = createLimiter(
  60 * 1000,
  120,
  "Too many inbound requests, please try again later"
);

export const mutationLimiter = createLimiter(
  10 * 60 * 1000,
  60,
  "Too many requests, please try again later"
);
