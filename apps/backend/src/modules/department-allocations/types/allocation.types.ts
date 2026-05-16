import { Document, Types } from "mongoose";

export interface AllocationDocument extends Document {
  settlementId: Types.ObjectId;
  departmentId: Types.ObjectId;
  amount: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}
