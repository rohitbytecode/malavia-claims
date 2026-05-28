import { z } from "zod";

export const updateAdvancedNotificationSchema = z.object({
  body: z.object({
    notificationEmail: z
      .string()
      .trim()
      .email("A valid notification email is required"),
    isEnabled: z.boolean().optional(),
    updatedBy: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
