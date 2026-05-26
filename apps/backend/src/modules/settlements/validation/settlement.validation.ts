import { z } from "zod";
import { SettlementMethod } from "../constant/settlement-method.enum.js";
import { DepartmentCategory } from "@/modules/payer-contracts/constant/department-category.enum.js";

const departmentBreakdownItemSchema = z.object({
  departmentCategory: z.nativeEnum(DepartmentCategory),
  claimedAmount: z.number().nonnegative(),
  approvedAmount: z.number().nonnegative(),
  deduction: z.number().nonnegative().optional().default(0),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  netAmount: z.number().nonnegative(),
  companyDiscountPercent: z.number().min(0).max(100).optional().default(0),
  companyDiscountAmount: z.number().nonnegative().optional().default(0),
  vendorDiscountPercent: z.number().min(0).max(100).optional().default(0),
  vendorDiscountAmount: z.number().nonnegative().optional().default(0),
  vendorPayout: z.number().nonnegative().optional().default(0),
  hospitalShare: z.number().optional().default(0),
  remarks: z.string().trim().optional().default(""),
});

export const createSettlementSchema = z.object({
  body: z.object({
    claimId: z.string().trim().min(1),
    approvedAmount: z.number().nonnegative(),
    hospitalDiscount: z.number().nonnegative().optional().default(0),
    deductions: z.number().nonnegative().optional().default(0),
    tds: z.number().nonnegative().optional().default(0),
    settlementMethod: z.nativeEnum(SettlementMethod),
    remarks: z.string().trim().optional(),
    settledBy: z.string().trim().min(1),
    refundAmount: z.number().nonnegative().optional(),
    totalCompanyDiscount: z.number().nonnegative().optional().default(0),
    totalVendorPayout: z.number().nonnegative().optional().default(0),
    hospitalNetShare: z.number().optional().default(0),
    departmentBreakdown: z
      .array(departmentBreakdownItemSchema)
      .optional()
      .default([]),
    payerContractId: z.string().trim().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const getSettlementByClaimSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    claimId: z.string().trim().min(1),
  }),
});
