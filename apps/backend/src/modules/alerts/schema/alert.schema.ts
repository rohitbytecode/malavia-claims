import mongoose from "mongoose";
import { AlertDocument } from "../types/alert.types.js";
import { AlertType } from "../constant/alert-type.enum.js";
import { AlertSeverity } from "../constant/alert-severity.enum.js";

const alertSchema = new mongoose.Schema<AlertDocument>(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(AlertSeverity),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const AlertModel =
  mongoose.models.Alert || mongoose.model<AlertDocument>("Alert", alertSchema);
