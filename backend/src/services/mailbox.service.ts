import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import prisma from "../configs/prisma";
import { assertMaintenanceModeDisabled, getSettings } from "./settings.service";
import { ApiError } from "../utils/api-error";
import { buildMeta } from "../utils/pagination";

type CreateMailboxInput = {
  localPart?: string;
  domainId?: number;
  expiresInMinutes?: number;
};

type RenewMailboxInput = {
  expiresInMinutes?: number;
};

type ListMailboxesInput = {
  search?: string;
  domainId?: number;
  page: number;
  limit: number;
};

const WORD_SEEDS = [
  "swift",
  "nova",
  "luna",
  "milo",
  "kairo",
  "nori",
  "zento",
  "lunar",
  "pixel",
  "orbit",
  "signal",
  "tempo",
  "mail",
  "drop",
  "inbox",
  "mint",
  "raven",
  "cloud",
  "echo",
  "zen",
  "byte"
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SAFE_CHARS = `${ALPHABET}${DIGITS}`;

function randomChars(length: number) {
  return Array.from(
    { length },
    () => SAFE_CHARS[crypto.randomInt(SAFE_CHARS.length)]
  ).join("");
}

function randomTargetLength(minLength: number, maxLength: number) {
  const safeMin = Math.max(3, Math.min(32, minLength));
  const safeMax = Math.max(safeMin, Math.min(32, maxLength));

  return crypto.randomInt(safeMin, safeMax + 1);
}

function randomLocalPart(minLength: number, maxLength: number) {
  const targetLength = randomTargetLength(minLength, maxLength);
  const seed = WORD_SEEDS[crypto.randomInt(WORD_SEEDS.length)];
  const base = seed.slice(0, Math.min(seed.length, targetLength));

  if (base.length === targetLength) return base;

  return `${base}${randomChars(targetLength - base.length)}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function resolveDomain(domainId?: number) {
  if (domainId) {
    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        isActive: true
      }
    });

    if (!domain) {
      throw ApiError.badRequest("Active domain not found");
    }

    return domain;
  }

  const domain = await prisma.domain.findFirst({
    where: { isActive: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });

  if (!domain) {
    throw ApiError.badRequest("No active domains are available");
  }

  return domain;
}

function createExpiresAt(expiresInMinutes: number | null) {
  if (!expiresInMinutes) return null;

  return new Date(Date.now() + expiresInMinutes * 60 * 1000);
}

export function isMailboxExpired(mailbox: { expiresAt: Date | string | null }) {
  return Boolean(
    mailbox.expiresAt && new Date(mailbox.expiresAt).getTime() <= Date.now()
  );
}

export function assertMailboxReadable(mailbox: {
  expiresAt: Date | string | null;
}) {
  if (isMailboxExpired(mailbox)) {
    throw ApiError.gone("Mailbox has expired");
  }
}

async function createMailboxRecord(
  localPart: string,
  domain: { id: number; name: string },
  expiresAt: Date | null
) {
  return prisma.mailbox.create({
    data: {
      localPart,
      address: `${localPart}@${domain.name}`,
      domainId: domain.id,
      expiresAt
    },
    include: {
      domain: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

export async function createMailbox(
  input: CreateMailboxInput,
  options: { isAdmin?: boolean } = {}
) {
  const settings = await assertMaintenanceModeDisabled();

  if (!settings.allowPublicMailboxCreation) {
    throw ApiError.forbidden("Public mailbox creation is disabled");
  }

  const reservedLocalParts = new Set(settings.reservedLocalParts);
  const domain = await resolveDomain(input.domainId);
  const expiresAt = createExpiresAt(
    input.expiresInMinutes ?? settings.defaultMailboxExpiryMinutes
  );

  if (input.localPart) {
    if (!options.isAdmin && reservedLocalParts.has(input.localPart)) {
      throw ApiError.forbidden(
        "You are not allowed to create this email address"
      );
    }

    try {
      return await createMailboxRecord(input.localPart, domain, expiresAt);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ApiError.conflict("Mailbox already exists");
      }

      throw error;
    }
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = randomLocalPart(
      settings.randomLocalPartMinLength,
      settings.randomLocalPartMaxLength
    );

    if (reservedLocalParts.has(candidate)) {
      continue;
    }

    try {
      return await createMailboxRecord(candidate, domain, expiresAt);
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw ApiError.conflict("Could not generate a unique mailbox");
}

export async function listMailboxes(input: ListMailboxesInput) {
  const where: Prisma.MailboxWhereInput = {
    ...(input.domainId && { domainId: input.domainId }),
    ...(input.search && {
      OR: [
        { address: { contains: input.search } },
        { localPart: { contains: input.search } }
      ]
    })
  };

  const skip = (input.page - 1) * input.limit;

  const [items, total] = await prisma.$transaction([
    prisma.mailbox.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        domain: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    }),
    prisma.mailbox.count({ where })
  ]);

  return {
    items,
    meta: buildMeta(total, input.page, input.limit)
  };
}

export async function getMailboxByAddress(address: string) {
  const mailbox = await prisma.mailbox.findUnique({
    where: { address },
    include: {
      domain: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!mailbox) {
    throw ApiError.notFound("Mailbox not found");
  }

  return mailbox;
}

export async function renewMailbox(
  address: string,
  input: RenewMailboxInput = {}
) {
  const settings = await assertMaintenanceModeDisabled();
  const expiresAt = createExpiresAt(
    input.expiresInMinutes ?? settings.defaultMailboxExpiryMinutes
  );

  await getMailboxByAddress(address);

  return prisma.mailbox.update({
    where: { address },
    data: { expiresAt },
    include: {
      domain: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

export async function deleteMailbox(address: string) {
  await assertMaintenanceModeDisabled();
  await getMailboxByAddress(address);

  await prisma.mailbox.delete({
    where: { address }
  });
}

export async function listMailboxMessages(address: string) {
  const mailbox = await getMailboxByAddress(address);

  assertMailboxReadable(mailbox);

  return prisma.message.findMany({
    where: {
      mailboxId: mailbox.id
    },
    select: {
      id: true,
      fromAddress: true,
      subject: true,
      textBody: true,
      htmlBody: true,
      isRead: true,
      receivedAt: true
    },
    orderBy: {
      receivedAt: "desc"
    }
  });
}

// Admin-only: intentionally does NOT call assertMailboxReadable so admins can
// review messages of expired mailboxes during the retention window.
export async function listMailboxMessagesForAdmin(address: string) {
  const mailbox = await getMailboxByAddress(address);

  return prisma.message.findMany({
    where: {
      mailboxId: mailbox.id
    },
    select: {
      id: true,
      fromAddress: true,
      subject: true,
      textBody: true,
      htmlBody: true,
      isRead: true,
      receivedAt: true
    },
    orderBy: {
      receivedAt: "desc"
    }
  });
}
