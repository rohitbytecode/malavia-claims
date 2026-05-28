import { Request, Response } from "express";
import { AdvancedNotificationService } from "../service/advanced-notification.service.js";

export class AdvancedNotificationController {
  static async getSettings(_req: Request, res: Response) {
    const settings = await AdvancedNotificationService.getSettings();

    return res.status(200).json({
      success: true,
      message: "Advanced notification settings fetched successfully",
      data: settings,
    });
  }

  static async saveSettings(req: Request, res: Response) {
    const settings = await AdvancedNotificationService.saveSettings(req.body);

    return res.status(200).json({
      success: true,
      message: "Advanced notification settings saved successfully",
      data: settings,
    });
  }
}
