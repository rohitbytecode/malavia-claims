import mongoose from "mongoose";
import { DepartmentDocument } from "@/modules/departments/types/department.types.js";

const departmentSchema = new mongoose.Schema<DepartmentDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const DepartmentModel =
  mongoose.models.Department ||
  mongoose.model<DepartmentDocument>("Department", departmentSchema);
