import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { env } from "@/config/env.js";

const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (mongoSanitize as any).sanitize as (target: any) => any;

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  if (req.headers) {
    req.headers = sanitize(req.headers);
  }

  // Express 5 can make req.query read-only; avoid assigning to it directly.
  if (req.query && typeof req.query === "object") {
    const sanitizedQuery = sanitize(req.query);
    Object.entries(sanitizedQuery).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        try {
          (req.query as any)[key] = value;
        } catch {
          // skip readonly query properties
        }
      }
    });
  }

  next();
};

// Rate limiting middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX, // Limit each IP to configured max requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => env.NODE_ENV === "development", // Bypass rate limiting in dev mode
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

export const setupSecurityMiddleware = (app: Application) => {
  // Set security HTTP headers
  app.use(helmet());

  // Data sanitization against NoSQL query injection
  app.use(sanitizeRequest);
};
