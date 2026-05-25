import { Request, Response } from "express";
import { UserService } from "@/modules/users/service/user.service.js";
import { AppError } from "@/core/errors/AppError.js";

export class UserController {
  static async createUser(req: Request, res: Response) {
    const user = await UserService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  }

  static async listUsers(req: Request, res: Response) {
    const { role, isActive, page, limit } = req.query as {
      role?: string;
      isActive?: string;
      page?: string;
      limit?: string;
    };

    const users = await UserService.listUsers(
      role as any,
      isActive === undefined ? undefined : isActive === "true",
      Number(page ?? 1),
      Number(limit ?? 20)
    );

    return res.status(200).json({
      success: true,
      message: "Users listed successfully",
      data: users,
    });
  }

  static async getUser(req: Request, res: Response) {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    const user = await UserService.getUserById(userId);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  }

  static async updateUser(req: Request, res: Response) {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    // Prevent changing own role
    if (
      req.user &&
      req.user.id === userId &&
      req.body.role &&
      req.body.role !== req.user.role
    ) {
      throw new AppError("Changing your own role is not permitted", 400);
    }

    // Prevent deactivating self via update
    if (req.user && req.user.id === userId && req.body.isActive === false) {
      throw new AppError("Deactivating yourself is not permitted", 400);
    }

    const user = await UserService.updateUser(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  }

  static async deactivateUser(req: Request, res: Response) {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    // Prevent deactivating self
    if (req.user && req.user.id === userId) {
      throw new AppError("Deactivating yourself is not permitted", 400);
    }

    const user = await UserService.deactivateUser(userId);

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  }
}
