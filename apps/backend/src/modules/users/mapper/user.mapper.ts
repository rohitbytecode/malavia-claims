import { UserDocument } from "@/modules/users/types/user.types.js";

export const toUserResponse = (user: Partial<UserDocument>) => {
  return {
    id: user._id?.toString() ?? null,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
