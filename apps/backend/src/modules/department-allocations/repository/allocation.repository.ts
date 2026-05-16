import { Types } from "mongoose";
import { AllocationModel } from "../schema/allocation.schema.js";

interface CreateAllocationPayload {
  settlementId: string;
  departmentId: string;
  amount: number;
  remarks?: string;
}

export class AllocationRepository {
  static async createAllocations(payloads: CreateAllocationPayload[]) {
    const docs = payloads.map((p) => ({
      ...p,
      settlementId: new Types.ObjectId(p.settlementId),
      departmentId: new Types.ObjectId(p.departmentId),
    }));

    return AllocationModel.insertMany(docs);
  }

  static async getAllocationsBySettlement(settlementId: string) {
    if (!Types.ObjectId.isValid(settlementId)) return [];

    return AllocationModel.find({ settlementId: new Types.ObjectId(settlementId) })
      .populate("departmentId", "name")
      .lean();
  }

  static async getTotalAllocatedAmount(settlementId: string): Promise<number> {
    if (!Types.ObjectId.isValid(settlementId)) return 0;

    const result = await AllocationModel.aggregate([
      { $match: { settlementId: new Types.ObjectId(settlementId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}
