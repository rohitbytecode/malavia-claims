import { z } from "zod";

export const listActiveAlertsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({}).optional(),
});

export const getAlertsByClaimSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    claimId: z.string().trim().min(1),
  }),
});

export const resolveAlertSchema = z.object({
  body: z.object({
    resolvedBy: z.string().trim().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({
    alertId: z.string().trim().min(1),
  }),
});
