import env from "../configs/env";
import prisma from "../configs/prisma";

const expiredMailboxWhere = () => ({
  expiresAt: {
    not: null,
    lte: new Date()
  }
});

export async function getCleanupStats() {
  const [expiredMailboxes, totalMailboxes, totalMessages] =
    await prisma.$transaction([
      prisma.mailbox.count({
        where: expiredMailboxWhere()
      }),
      prisma.mailbox.count(),
      prisma.message.count()
    ]);

  return {
    expiredMailboxes,
    totalMailboxes,
    totalMessages,
    nextRunHint: `Every ${env.CLEANUP_INTERVAL_SECONDS} seconds`
  };
}

export async function cleanupExpiredMailboxes() {
  const result = await prisma.mailbox.deleteMany({
    where: expiredMailboxWhere()
  });

  return {
    deletedMailboxes: result.count,
    ranAt: new Date().toISOString()
  };
}
