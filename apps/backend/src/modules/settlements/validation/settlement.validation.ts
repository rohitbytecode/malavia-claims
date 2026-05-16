import { z } from "zod";
import { SettlementMethod } from "../constant/settlement-method.enum.js";

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
