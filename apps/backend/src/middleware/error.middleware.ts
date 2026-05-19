import { Request, Response, NextFunction } from "express";
import { AppError } from "@/core/errors/AppError.js";
import { logger } from "@/config/logger.js";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("ERROR Middleware HIT:", error.message, error.stack);
  logger.error(error, "Unhandled error");

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
