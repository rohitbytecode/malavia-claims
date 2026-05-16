import { AlertRepository } from "../repository/alert.repository.js";
import { AlertType } from "../constant/alert-type.enum.js";
import { AlertSeverity } from "../constant/alert-severity.enum.js";
import { AppError } from "@/core/errors/AppError.js";

interface CreateAlertParams {
  claimId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

export class AlertService {
  static async createAlert(params: CreateAlertParams) {
    try {
      await AlertRepository.createAlert(params);
    } catch (error) {
      console.error("[AlertService] Failed to create alert:", error);
    }
  }

  static async resolveAlert(alertId: string, resolvedBy: string) {
    const alert = await AlertRepository.resolveAlert(alertId, resolvedBy);

    if (!alert) {
      throw new AppError("Alert not found", 404);
    }

    return alert;
  }

  static async listActiveAlerts(page: number = 1, limit: number = 20) {
    return AlertRepository.listActiveAlerts(page, limit);
  }

  static async getAlertsByClaim(claimId: string) {
    return AlertRepository.getAlertsByClaim(claimId);
  }
}
