import mongoose from "mongoose";
import { DoctorDocument } from "@/modules/doctors/types/doctor.types.js";

const doctorSchema = new mongoose.Schema<DoctorDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DoctorModel =
  mongoose.models.Doctor ||
  mongoose.model<DoctorDocument>("Doctor", doctorSchema);
