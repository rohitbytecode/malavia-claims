import { z } from "zod";
import { SubmissionMethod } from "@/modules/insurance-companies/constant/submission-method.enum.js";

const contactPersonSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  designation: z.string().optional(),
});

const escalationContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  level: z.string().min(1),
});

const createCompanyBody = z.object({
  name: z.string().min(3),
  submissionMethods: z.array(z.nativeEnum(SubmissionMethod)).min(1),
  portalUrl: z.string().url().optional(),
  portalUsername: z.string().trim().optional(),
  portalPassword: z.string().trim().optional(),
  email: z.string().email().optional(),
  courierAddress: z.string().optional(),
  tatDays: z.number().int().nonnegative().optional().default(0),
  contactPersons: z.array(contactPersonSchema).optional().default([]),
  escalationMatrix: z.array(escalationContactSchema).optional().default([]),
  remarks: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

const updateCompanyBody = createCompanyBody.partial();

export const createInsuranceCompanySchema = z.object({
  body: createCompanyBody,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listInsuranceCompaniesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    isActive: z.preprocess((value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return undefined;
    }, z.boolean().optional()),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({}).optional(),
});

export const companyIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    companyId: z.string().trim().min(1),
  }),
});

export const updateInsuranceCompanySchema = z.object({
  body: updateCompanyBody,
  query: z.object({}).optional(),
  params: z.object({
    companyId: z.string().trim().min(1),
  }),
});
