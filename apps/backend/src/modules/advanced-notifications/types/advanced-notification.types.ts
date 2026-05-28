import { Document, Types } from "mongoose";

export interface AdvancedNotificationDocument extends Document {
  notificationEmail: string;
  isEnabled: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdvancedNotificationResponse {
  id: string;
  notificationEmail: string;
  isEnabled: boolean;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
