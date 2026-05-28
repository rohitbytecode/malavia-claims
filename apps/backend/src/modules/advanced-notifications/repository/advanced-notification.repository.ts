import { Types } from "mongoose";
import { AdvancedNotificationModel } from "../schema/advanced-notification.schema.js";

interface UpsertAdvancedNotificationPayload {
  notificationEmail: string;
  isEnabled: boolean;
  updatedBy?: string;
}

export class AdvancedNotificationRepository {
  static async getSettings() {
    return AdvancedNotificationModel.findOne().sort({ updatedAt: -1 }).lean();
  }

  static async upsertSettings(payload: UpsertAdvancedNotificationPayload) {
    const existing = await AdvancedNotificationModel.findOne().sort({
      updatedAt: -1,
    });
    const updatedBy =
      payload.updatedBy && Types.ObjectId.isValid(payload.updatedBy)
        ? new Types.ObjectId(payload.updatedBy)
        : undefined;

    if (existing) {
      existing.notificationEmail = payload.notificationEmail;
      existing.isEnabled = payload.isEnabled;
      existing.updatedBy = updatedBy;
      await existing.save();
      return existing.toObject();
    }

    return AdvancedNotificationModel.create({
      notificationEmail: payload.notificationEmail,
      isEnabled: payload.isEnabled,
      updatedBy,
    });
  }
}
