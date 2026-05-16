import { Request, Response } from "express";
import { AlertService } from "../service/alert.service.js";

export class AlertController {
  static async listActiveAlerts(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const alerts = await AlertService.listActiveAlerts(page, limit);

    return res.status(200).json({
      success: true,
      message: "Active alerts fetched successfully",
      data: alerts,
    });
  }

  static async getAlertsByClaim(req: Request, res: Response) {
    const { claimId } = req.params;

    const alerts = await AlertService.getAlertsByClaim(claimId as string);

    return res.status(200).json({
      success: true,
      message: "Claim alerts fetched successfully",
      data: alerts,
    });
  }

  static async resolveAlert(req: Request, res: Response) {
    const { alertId } = req.params;
    const { resolvedBy } = req.body;

    const alert = await AlertService.resolveAlert(alertId as string, resolvedBy);

    return res.status(200).json({
      success: true,
      message: "Alert resolved successfully",
      data: alert,
    });
  }
}
