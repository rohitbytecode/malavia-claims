import { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { env } from "./env.js";
import { logger } from "./logger.js";

let io: SocketServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info("Socket.io server initialized");
  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error("Socket.io has not been initialized. Call initSocketServer first.");
  }
  return io;
}
