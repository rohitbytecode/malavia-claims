import { hashPassword } from "@/modules/auth/utils/password.util.js";
import { AppError } from "@/core/errors/AppError.js";
import { UserRepository } from "@/modules/users/repository/user.repository.js";
import { toUserResponse } from "@/modules/users/mapper/user.mapper.js";
import { Roles } from "@/core/enums/roles.enum.js";
import { UserDocument } from "@/modules/users/types/user.types.js";

interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: Roles;
  isActive?: boolean;
}

interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Roles;
  isActive?: boolean;
}

export class UserService {
  static async createUser(payload: CreateUserPayload) {
    const existingUser = await UserRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await hashPassword(payload.password);
    const user = await UserRepository.createUser({
      fullName: payload.fullName,
      email: payload.email.toLowerCase().trim(),
      password: hashedPassword,
      role: payload.role,
      isActive: payload.isActive ?? true,
    } as Partial<UserDocument>);

    return toUserResponse(user);
  }

  static async listUsers(
    role: Roles | undefined,
    isActive: boolean | undefined,
    page: number,
    limit: number
  ) {
    const users = await UserRepository.listUsers(
      { role, isActive },
      page,
      limit
    );

    return users.map(toUserResponse);
  }

  static async getUserById(userId: string) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toUserResponse(user);
  }

  static async updateUser(userId: string, payload: UpdateUserPayload) {
    const updatePayload: Partial<UserDocument> = {};

    if (payload.fullName) {
      updatePayload.fullName = payload.fullName;
    }

    if (payload.email) {
      updatePayload.email = payload.email.toLowerCase().trim();
    }

    if (payload.password) {
      updatePayload.password = await hashPassword(payload.password);
    }

    if (payload.role) {
      updatePayload.role = payload.role;
    }

    if (typeof payload.isActive === "boolean") {
      updatePayload.isActive = payload.isActive;
    }

    const updatedUser = await UserRepository.updateUser(userId, updatePayload);

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    return toUserResponse(updatedUser);
  }

  static async deactivateUser(userId: string) {
    const user = await UserRepository.updateUser(userId, { isActive: false });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toUserResponse(user);
  }
}
