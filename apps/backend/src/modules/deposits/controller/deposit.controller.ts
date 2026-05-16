import { Request, Response } from "express";
import { DepositService } from "../service/deposit.service.js";

export class DepositController {
  static async createDeposit(req: Request, res: Response) {
    const deposit = await DepositService.createDeposit(req.body);

    return res.status(201).json({
      success: true,
      message: "Deposit record created successfully",
      data: deposit,
    });
  }

  static async getDepositByClaimId(req: Request, res: Response) {
    const { claimId } = req.params;
    const deposit = await DepositService.getDepositByClaimId(claimId as string);

    return res.status(200).json({
      success: true,
      message: "Deposit fetched successfully",
      data: deposit,
    });
  }

  static async updateRefundStatus(req: Request, res: Response) {
    const { depositId } = req.params;
    const deposit = await DepositService.updateRefundStatus(
      depositId as string,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: deposit,
    });
  }
}
