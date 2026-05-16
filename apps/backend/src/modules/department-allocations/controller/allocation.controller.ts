import { Request, Response } from "express";
import { AllocationService } from "../service/allocation.service.js";

export class AllocationController {
  static async createAllocations(req: Request, res: Response) {
    const allocations = await AllocationService.allocateAmount(req.body);

    return res.status(201).json({
      success: true,
      message: "Allocations created successfully",
      data: allocations,
    });
  }

  static async getAllocationsBySettlement(req: Request, res: Response) {
    const { settlementId } = req.params;
    const allocations = await AllocationService.getAllocationsBySettlement(settlementId as string);

    return res.status(200).json({
      success: true,
      message: "Allocations fetched successfully",
      data: allocations,
    });
  }
}
