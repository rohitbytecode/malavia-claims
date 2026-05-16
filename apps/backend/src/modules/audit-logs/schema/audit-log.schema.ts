import mongoose from "mongoose";
import { AuditLogDocument } from "../types/audit-log.types.js";
import { AuditModule } from "../constant/audit-module.enum.js";
import { AuditAction } from "../constant/audit-action.enum.js";

const auditLogSchema = new mongoose.Schema<AuditLogDocument>(
  {
    module: {
      type: String,
      enum: Object.values(AuditModule),
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLogModel =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
