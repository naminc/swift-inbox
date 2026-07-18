import env from "../configs/env";
import { cleanupExpiredMailboxes } from "../services/cleanup.service";
import { logger } from "../utils/logger";

export function startCleanupWorker(): NodeJS.Timeout | null {
  if (env.NODE_ENV === "test") {
    return null;
  }

  const intervalMs = env.CLEANUP_INTERVAL_SECONDS * 1000;

  const runCleanup = async () => {
    try {
      const result = await cleanupExpiredMailboxes();

      if (result.deletedMailboxes > 0) {
        logger.info(
          result,
          "[cleanup]: Expired mailboxes purged after retention"
        );
      }
    } catch (error) {
      logger.error(error, "[cleanup]: Cleanup worker failed");
    }
  };

  void runCleanup();

  const interval = setInterval(() => {
    void runCleanup();
  }, intervalMs);

  interval.unref?.();
  logger.info(
    `[cleanup]: Cleanup worker scheduled every ${env.CLEANUP_INTERVAL_SECONDS} seconds`
  );

  return interval;
}
