import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/modules/auth/utils/jwt.util.js";
import { AppError } from "@/core/errors/AppError.js";
import { Roles } from "@/core/enums/roles.enum.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  const token =
    typeof authorization === "string"
      ? authorization.replace("Bearer ", "")
      : "";

  if (!token) {
    throw new AppError("Authorization token missing", 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role as Roles,
    };
    next();
  } catch (error) {
    throw new AppError("Invalid or expired access token", 401);
  }
};


export const restrictTo = (...allowedRoles: Roles[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  };
};

export const excludeRoles = (...excludedRoles: Roles[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || excludedRoles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  };
};
