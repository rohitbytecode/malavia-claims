import { z } from "zod";
import { CommunicationMedium } from "@/modules/communications/constant/communication-medium.enum.js";

const createCommunicationBody = z.object({
  claimId: z.string().trim().min(1),
  type: z.string().min(1),
  medium: z.nativeEnum(CommunicationMedium),
  remarks: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
  createdBy: z.string().trim().optional(),
});

export const createCommunicationSchema = z.object({
  body: createCommunicationBody,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listCommunicationsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    claimId: z.string().trim().min(1),
    medium: z.nativeEnum(CommunicationMedium).optional(),
    followUpBefore: z.string().datetime().optional(),
    followUpAfter: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({}).optional(),
});
