import mongoose from "mongoose";
import { SettlementDocument } from "../types/settlement.types.js";
import { SettlementMethod } from "../constant/settlement-method.enum.js";

const settlementSchema = new mongoose.Schema<SettlementDocument>(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      unique: true, // One settlement per claim
    },
    approvedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    hospitalDiscount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deductions: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tds: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    netPayable: {
      type: Number,
      required: true,
      min: 0,
    },
    settlementMethod: {
      type: String,
      enum: Object.values(SettlementMethod),
      required: true,
    },
    settlementDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    remarks: {
      type: [String],
      default: [],
    },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SettlementModel =
  mongoose.models.Settlement ||
  mongoose.model<SettlementDocument>("Settlement", settlementSchema);
