import { Request, Response, NextFunction } from "express";
import { Roles } from "@/core/enums/roles.enum.js";

export const allowRoles =
  (...roles: Roles[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    next();
  };