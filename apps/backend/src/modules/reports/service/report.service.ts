import { ClaimModel } from "@/modules/claims/schema/claim.schema.js";

export class ReportService {
  static async generatePatientClaimSummary(patientId: string) {
    return ClaimModel.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalClaimAmount" },
        },
      },
    ]);
  }

  static async generateInsurancePerformance() {
    return ClaimModel.aggregate([
      { $match: { insuranceCompanyId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$insuranceCompanyId",
          totalClaims: { $sum: 1 },
          totalClaimAmount: { $sum: "$totalClaimAmount" },
          settledClaims: {
            $sum: { $cond: [{ $eq: ["$status", "SETTLED"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "insurancecompanies",
          localField: "_id",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $project: {
          companyName: "$company.name",
          totalClaims: 1,
          totalClaimAmount: 1,
          settledClaims: 1,
          settlementRatio: {
            $multiply: [{ $divide: ["$settledClaims", "$totalClaims"] }, 100],
          },
        },
      },
      { $sort: { totalClaims: -1 } },
    ]);
  }

  static async generateMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return ClaimModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalClaimAmount" },
        },
      },
    ]);
  }
}

// Added mongoose import for ObjectId
import mongoose from "mongoose";
