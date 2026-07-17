import crypto from "node:crypto";
import { Request, Response } from "express";
import { z } from "zod";
import env from "../configs/env";
import { receiveCloudflareEmail } from "../services/inbound.service";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";

const cloudflareInboundSchema = z.object({
  to: z.email(),
  from: z.email(),
  subject: z.string().max(500).nullable().optional(),
  textBody: z.string().max(500_000).nullable().optional(),
  htmlBody: z.string().max(1_000_000).nullable().optional(),
  rawPayload: z.unknown().optional()
});

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifyInboundSecret(req: Request) {
  const secret = req.header("x-inbound-secret");

  if (!secret || !timingSafeEqual(secret, env.INBOUND_WEBHOOK_SECRET)) {
    throw ApiError.unauthorized("Invalid inbound secret");
  }
}

export const postCloudflareInboundEmail = AsyncHandler(
  async (req: Request, res: Response) => {
    verifyInboundSecret(req);

    const result = cloudflareInboundSchema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.validation(
        "Invalid inbound email payload",
        result.error.flatten()
      );
    }

    const inboundResult = await receiveCloudflareEmail(result.data);

    return ApiResponse.ok(
      res,
      inboundResult.accepted
        ? "Inbound email accepted"
        : "Inbound email ignored",
      inboundResult
    );
  }
);
