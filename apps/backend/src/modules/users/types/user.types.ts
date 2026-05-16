import { Document, Types } from "mongoose";
import { Roles } from "@/core/enums/roles.enum.js";

export interface UserBase {
  fullName: string;
  email: string;
  password: string;
  role: Roles;
  isActive: boolean;
  refreshTokenHash?: string;
}

export interface UserDocument extends UserBase, Document {
  createdAt: Date;
  updatedAt: Date;
}
