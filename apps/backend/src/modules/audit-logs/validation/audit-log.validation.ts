import { z } from "zod";
import { AuditModule } from "../constant/audit-module.enum.js";

export const getEntityLogsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({
    entityId: z.string().trim().min(1),
  }),
});

export const getModuleLogsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({
    module: z.nativeEnum(AuditModule),
  }),
});
