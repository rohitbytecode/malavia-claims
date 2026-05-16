import { z } from "zod";
import { RefundMode } from "../constant/refund-mode.enum.js";

export const createDepositSchema = z.object({
  body: z.object({
    claimId: z.string().trim().min(1),
    collectedAmount: z.number().nonnegative(),
    remarks: z.string().trim().optional(),
    createdBy: z.string().trim().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const getDepositByClaimSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    claimId: z.string().trim().min(1),
  }),
});

export const updateRefundSchema = z.object({
  body: z.object({
    refundAmount: z.number().nonnegative(),
    refundMode: z.nativeEnum(RefundMode),
    remarks: z.string().trim().optional(),
    updatedBy: z.string().trim().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({
    depositId: z.string().trim().min(1),
  }),
});
