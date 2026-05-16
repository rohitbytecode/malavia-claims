import { Request, Response } from "express";
import { DashboardService } from "../service/dashboard.service.js";

export class DashboardController {
  static async getMetrics(req: Request, res: Response) {
    const metrics = await DashboardService.getDashboardMetrics();

    return res.status(200).json({
      success: true,
      message: "Dashboard metrics fetched successfully",
      data: metrics,
    });
  }
}
