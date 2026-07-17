import app from "./app";
import env from "./configs/env";
import { logger } from "./utils/logger";
import { configureGracefulShutdown } from "./utils/shutdown";
import { startCleanupWorker } from "./workers/cleanup.worker";

const port = env.PORT || 9000;
let cleanupWorker: NodeJS.Timeout | null = null;

process.on("unhandledRejection", reason => {
  logger.fatal(reason, "[process]: Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", error => {
  logger.fatal(error, "[process]: Uncaught exception");
  process.exit(1);
});

const server = app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
  logger.info(`[server]: Environment: ${env.NODE_ENV}`);
  cleanupWorker = startCleanupWorker();
});

server.on("close", () => {
  if (cleanupWorker) {
    clearInterval(cleanupWorker);
    cleanupWorker = null;
  }
});

configureGracefulShutdown(server);
