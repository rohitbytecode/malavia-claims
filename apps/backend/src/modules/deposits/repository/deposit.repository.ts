import { Types } from "mongoose";
import { DepositModel } from "../schema/deposit.schema.js";
import { DepositDocument } from "../types/deposit.types.js";

export class DepositRepository {
  static async createDeposit(payload: Partial<DepositDocument>) {
    return DepositModel.create(payload);
  }

  static async findDepositByClaimId(claimId: string) {
    if (!Types.ObjectId.isValid(claimId)) return null;
    return DepositModel.findOne({ claimId: new Types.ObjectId(claimId) });
  }

  static async findDepositById(depositId: string) {
    if (!Types.ObjectId.isValid(depositId)) return null;
    return DepositModel.findById(depositId);
  }

  static async updateDeposit(depositId: string, updates: Partial<DepositDocument>) {
    return DepositModel.findByIdAndUpdate(depositId, updates, { new: true });
  }
}
