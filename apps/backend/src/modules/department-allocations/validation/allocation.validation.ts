import { z } from "zod";

const allocationItemSchema = z.object({
  departmentId: z.string().trim().min(1),
  amount: z.number().positive(),
  remarks: z.string().trim().optional(),
});

export const createAllocationsSchema = z.object({
  body: z.object({
    settlementId: z.string().trim().min(1),
    allocations: z.array(allocationItemSchema).min(1),
    allocatedBy: z.string().trim().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const getAllocationsBySettlementSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    settlementId: z.string().trim().min(1),
  }),
});
