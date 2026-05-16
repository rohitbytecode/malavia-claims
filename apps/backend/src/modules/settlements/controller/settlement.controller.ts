import { Request, Response } from "express";
import { SettlementService } from "../service/settlement.service.js";

export class SettlementController {
  static async createSettlement(req: Request, res: Response) {
    const settlement = await SettlementService.createSettlement(req.body);

    return res.status(201).json({
      success: true,
      message: "Settlement created successfully",
      data: settlement,
    });
  }

  static async getSettlementByClaimId(req: Request, res: Response) {
    const { claimId } = req.params;
    const settlement = await SettlementService.getSettlementByClaimId(claimId as string);

    return res.status(200).json({
      success: true,
      message: "Settlement fetched successfully",
      data: settlement,
    });
  }
}
