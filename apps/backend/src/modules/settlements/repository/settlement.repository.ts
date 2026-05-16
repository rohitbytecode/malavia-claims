import { Types } from "mongoose";
import { SettlementModel } from "../schema/settlement.schema.js";
import { SettlementDocument } from "../types/settlement.types.js";

export class SettlementRepository {
  static async createSettlement(payload: Partial<SettlementDocument>) {
    return SettlementModel.create(payload);
  }

  static async findSettlementByClaimId(claimId: string) {
    if (!Types.ObjectId.isValid(claimId)) return null;
    return SettlementModel.findOne({ claimId: new Types.ObjectId(claimId) });
  }

  static async findSettlementById(settlementId: string) {
    if (!Types.ObjectId.isValid(settlementId)) return null;
    return SettlementModel.findById(settlementId);
  }

  static async updateSettlement(
    settlementId: string,
    updates: Partial<SettlementDocument>,
    remarks?: string
  ) {
    const updatePayload: any = { ...updates };

    if (remarks) {
      updatePayload.$push = { remarks };
    }

    return SettlementModel.findByIdAndUpdate(settlementId, updatePayload, {
      new: true,
    });
  }
}
