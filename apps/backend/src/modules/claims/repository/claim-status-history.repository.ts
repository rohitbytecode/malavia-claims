import { Types } from "mongoose";
import { ClaimStatusHistoryModel } from "@/modules/claims/schema/claim-status-history.schema.js";
import { ClaimStatusHistoryDocument } from "@/modules/claims/types/claim.types.js";

export class ClaimStatusHistoryRepository {
  static async createClaimStatusHistory(
    payload: Partial<ClaimStatusHistoryDocument>,
  ) {
    return ClaimStatusHistoryModel.create(payload);
  }

  static async findByClaimId(claimId: string) {
    if (!Types.ObjectId.isValid(claimId)) {
      return [];
    }

    return ClaimStatusHistoryModel.find({
      claimId: new Types.ObjectId(claimId),
    }).sort({
      createdAt: -1,
    });
  }
}
