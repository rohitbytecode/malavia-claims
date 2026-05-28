import app from "./app.js";
import { createServer } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./config/db.js";
import { initCronJobs } from "./jobs/cron.js";
import { initSocketServer } from "./config/socket.js";

import mongoose from "mongoose";

const startServer = async () => {
  await connectDatabase();

  const httpServer = createServer(app);

  // Initialize Socket.io on the same HTTP server
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
    initCronJobs();
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    httpServer.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        logger.error(err, "Error during MongoDB disconnect:");
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startServer();
