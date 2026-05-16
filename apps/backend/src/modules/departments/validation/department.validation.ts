import { z } from "zod";

const createDepartmentBody = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateDepartmentBody = createDepartmentBody.partial();

export const createDepartmentSchema = z.object({
  body: createDepartmentBody,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listDepartmentsSchema = z.object({
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

export const departmentIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    departmentId: z.string().trim().min(1),
  }),
});

export const updateDepartmentSchema = z.object({
  body: updateDepartmentBody,
  query: z.object({}).optional(),
  params: z.object({
    departmentId: z.string().trim().min(1),
  }),
});
