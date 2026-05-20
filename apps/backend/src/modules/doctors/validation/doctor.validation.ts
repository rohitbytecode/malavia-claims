import { z } from "zod";

const nameValidation = z
  .string()
  .trim()
  .min(1, "Doctor name is required")
  .refine(
    (name) => {
      const normalized = name.toLowerCase();
      return !(normalized.startsWith("dr.") || normalized.startsWith("dr "));
    },
    {
      message: "Doctor name should not start with 'Dr.' or 'dr.' prefix",
    }
  );

const createDoctorBodySchema = z.object({
  name: nameValidation,
  departmentId: z.string().trim().min(1, "Department is required"),
  isActive: z.boolean().optional(),
});

export const createDoctorSchema = z.object({
  body: createDoctorBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listDoctorsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(100),
  }),
  params: z.object({}).optional(),
});

export const doctorIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    doctorId: z.string().trim().min(1),
  }),
});

export const updateDoctorSchema = z.object({
  body: createDoctorBodySchema.partial(),
  query: z.object({}).optional(),
  params: z.object({
    doctorId: z.string().trim().min(1),
  }),
});
