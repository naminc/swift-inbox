import env from "../configs/env";
import prisma from "../configs/prisma";
import { getSettings } from "./settings.service";

const expiredMailboxWhere = (cutoff: Date = new Date()) => ({
  expiresAt: {
    not: null,
    lte: cutoff
  }
});

function getRetentionCutoff(retentionDays: number) {
  return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
}

export async function getCleanupStats() {
  const settings = await getSettings();
  const retentionDays = settings.expiredMailboxRetentionDays;
  const cutoff = getRetentionCutoff(retentionDays);

  const [expiredMailboxes, purgeableMailboxes, totalMailboxes, totalMessages] =
    await prisma.$transaction([
      prisma.mailbox.count({ where: expiredMailboxWhere() }),
      prisma.mailbox.count({ where: expiredMailboxWhere(cutoff) }),
      prisma.mailbox.count(),
      prisma.message.count()
    ]);

  return {
    expiredMailboxes,
    purgeableMailboxes,
    retentionDays,
    totalMailboxes,
    totalMessages,
    nextRunHint: `Every ${env.CLEANUP_INTERVAL_SECONDS} seconds`
  };
}

export async function cleanupExpiredMailboxes() {
  const settings = await getSettings();
  const retentionDays = settings.expiredMailboxRetentionDays;
  const cutoff = getRetentionCutoff(retentionDays);

  const result = await prisma.mailbox.deleteMany({
    where: expiredMailboxWhere(cutoff)
  });

  return {
    deletedMailboxes: result.count,
    retentionDays,
    ranAt: new Date().toISOString()
  };
}
