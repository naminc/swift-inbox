import type { Prisma } from "@prisma/client";
import { simpleParser } from "mailparser";
import { z } from "zod";
import prisma from "../configs/prisma";
import { assertMaintenanceModeDisabled } from "./settings.service";
import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";

export type CloudflareInboundEmailInput = {
  to: string;
  from: string;
  subject?: string | null;
  textBody?: string | null;
  htmlBody?: string | null;
  rawPayload?: unknown;
};

type InboundRejectReason = "mailbox_not_found" | "mailbox_expired";

type InboundResult =
  | {
      accepted: true;
      messageId: number;
      mailboxId: number;
      deletedOldMessages?: number;
    }
  | {
      accepted: false;
      reason: InboundRejectReason;
    };

const emailSchema = z.email().max(254);

function normalizeEmail(value: string, field: "to" | "from") {
  const normalized = value.trim().toLowerCase();
  const result = emailSchema.safeParse(normalized);

  if (!result.success) {
    throw ApiError.validation("Invalid inbound email address", {
      fieldErrors: {
        [field]: result.error.issues.map(issue => issue.message)
      }
    });
  }

  return result.data;
}

function normalizeNullableText(value: string | null | undefined) {
  if (value === undefined || value === null) return null;

  return value.trim() || null;
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toPrismaJson(value: unknown) {
  if (value === undefined) return undefined;

  return value as Prisma.InputJsonValue;
}

async function parseInboundContent(input: CloudflareInboundEmailInput) {
  const raw = normalizeNullableText(input.textBody);
  const fallbackHtml = normalizeNullableText(input.htmlBody);
  const fallbackSubject =
    normalizeNullableText(input.subject) ?? "(No subject)";

  if (!raw) {
    return {
      subject: fallbackSubject,
      textBody: fallbackHtml ? stripHtml(fallbackHtml) : null,
      htmlBody: fallbackHtml
    };
  }

  try {
    const parsed = await simpleParser(raw);
    const parsedHtml = typeof parsed.html === "string" ? parsed.html : null;
    const htmlBody = normalizeNullableText(parsedHtml) ?? fallbackHtml;

    return {
      subject: normalizeNullableText(parsed.subject) ?? fallbackSubject,
      textBody:
        normalizeNullableText(parsed.text) ??
        (htmlBody ? stripHtml(htmlBody) : raw),
      htmlBody
    };
  } catch (error) {
    logger.warn(error, "[inbound]: Could not parse raw MIME email");

    return {
      subject: fallbackSubject,
      textBody: fallbackHtml ? stripHtml(fallbackHtml) : raw,
      htmlBody: fallbackHtml
    };
  }
}

const PRUNE_BUFFER = 5;

async function enforceMailboxMessageLimit(
  mailboxId: number,
  maxMessages: number
) {
  const total = await prisma.message.count({
    where: { mailboxId }
  });

  if (total <= maxMessages) return 0;

  const overflow = total - maxMessages + PRUNE_BUFFER;
  const oldMessages = await prisma.message.findMany({
    where: { mailboxId },
    orderBy: [{ receivedAt: "asc" }, { id: "asc" }],
    take: overflow,
    select: { id: true }
  });

  if (oldMessages.length === 0) return 0;

  const result = await prisma.message.deleteMany({
    where: {
      id: {
        in: oldMessages.map(message => message.id)
      }
    }
  });

  return result.count;
}

export async function receiveCloudflareEmail(
  input: CloudflareInboundEmailInput
): Promise<InboundResult> {
  const settings = await assertMaintenanceModeDisabled();
  const to = normalizeEmail(input.to, "to");
  const from = normalizeEmail(input.from, "from");

  const mailbox = await prisma.mailbox.findUnique({
    where: { address: to },
    select: {
      id: true,
      address: true,
      expiresAt: true
    }
  });

  if (!mailbox) {
    logger.info(
      { toDomain: to.split("@")[1], reason: "mailbox_not_found" },
      "[inbound]: Email ignored"
    );

    return {
      accepted: false,
      reason: "mailbox_not_found"
    };
  }

  if (mailbox.expiresAt && mailbox.expiresAt <= new Date()) {
    logger.info(
      { mailboxId: mailbox.id, reason: "mailbox_expired" },
      "[inbound]: Email ignored"
    );

    return {
      accepted: false,
      reason: "mailbox_expired"
    };
  }

  const parsedContent = await parseInboundContent(input);

  const message = await prisma.message.create({
    data: {
      mailboxId: mailbox.id,
      fromAddress: from,
      subject: parsedContent.subject,
      textBody: parsedContent.textBody,
      htmlBody: parsedContent.htmlBody,
      ...(input.rawPayload !== undefined && {
        rawPayload: toPrismaJson(input.rawPayload)
      })
    },
    select: {
      id: true,
      mailboxId: true
    }
  });

  const deletedOldMessages = await enforceMailboxMessageLimit(
    mailbox.id,
    settings.maxMailboxMessages
  );

  if (deletedOldMessages > 0) {
    logger.info(
      { mailboxId: mailbox.id, deletedOldMessages },
      "[inbound]: Old mailbox messages pruned"
    );
  }

  logger.info(
    { messageId: message.id, mailboxId: message.mailboxId },
    "[inbound]: Email accepted"
  );

  return {
    accepted: true,
    messageId: message.id,
    mailboxId: message.mailboxId,
    ...(deletedOldMessages > 0 && { deletedOldMessages })
  };
}
