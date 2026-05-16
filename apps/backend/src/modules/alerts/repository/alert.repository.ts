import { Types } from "mongoose";
import { AlertModel } from "../schema/alert.schema.js";
import { AlertType } from "../constant/alert-type.enum.js";
import { AlertSeverity } from "../constant/alert-severity.enum.js";

interface CreateAlertPayload {
  claimId: string | Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

export class AlertRepository {
  static async createAlert(payload: CreateAlertPayload) {
    return AlertModel.create({
      ...payload,
      claimId: new Types.ObjectId(payload.claimId),
    });
  }

  static async resolveAlert(alertId: string, resolvedBy: string) {
    if (!Types.ObjectId.isValid(alertId)) return null;

    return AlertModel.findByIdAndUpdate(
      alertId,
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: new Types.ObjectId(resolvedBy),
      },
      { new: true }
    );
  }

  static async listActiveAlerts(page: number, limit: number) {
    return AlertModel.find({ resolved: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("claimId", "claimNumber type status")
      .lean();
  }

  static async getAlertsByClaim(claimId: string) {
    if (!Types.ObjectId.isValid(claimId)) return [];

    return AlertModel.find({ claimId: new Types.ObjectId(claimId) })
      .sort({ createdAt: -1 })
      .lean();
  }
}
