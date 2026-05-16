import mongoose from "mongoose";
import { ClaimStatusHistoryDocument } from "@/modules/claims/types/claim.types.js";

const claimStatusHistorySchema =
  new mongoose.Schema<ClaimStatusHistoryDocument>(
    {
      claimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
        required: true,
        index: true,
      },
      fromStatus: {
        type: String,
        required: true,
      },
      toStatus: {
        type: String,
        required: true,
      },
      remarks: {
        type: String,
        default: "",
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      effectiveAt: {
        type: Date,
        required: true,
        default: () => new Date(),
      },
    },
    {
      timestamps: true,
    },
  );

export const ClaimStatusHistoryModel =
  mongoose.models.ClaimStatusHistory ||
  mongoose.model<ClaimStatusHistoryDocument>(
    "ClaimStatusHistory",
    claimStatusHistorySchema,
  );
