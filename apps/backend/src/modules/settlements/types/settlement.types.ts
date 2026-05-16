import { Document, Types } from "mongoose";
import { SettlementMethod } from "../constant/settlement-method.enum.js";

export interface SettlementDocument extends Document {
  claimId: Types.ObjectId;
  approvedAmount: number;
  hospitalDiscount: number;
  deductions: number;
  tds: number;
  netPayable: number;
  settlementMethod: SettlementMethod;
  settlementDate: Date;
  remarks: string[];
  settledBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
