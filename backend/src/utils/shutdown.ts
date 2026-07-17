import { Server } from "http";
import prisma from "../configs/prisma";
import { logger } from "./logger";

export const configureGracefulShutdown = (server: Server) => {
  const signals = ["SIGTERM", "SIGINT"];

  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`\n${signal} signal received. Shutting down gracefully...`);

      server.close(async err => {
        if (err) {
          logger.error(err, "Error during server close");
        }

        try {
          await prisma.$disconnect();
          logger.info("Database connection closed.");
        } catch (disconnectError) {
          logger.error(disconnectError, "Error disconnecting from database");
        }

        logger.info("HTTP server closed.");
        process.exit(err ? 1 : 0);
      });

      setTimeout(() => {
        logger.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    });
  });
};
