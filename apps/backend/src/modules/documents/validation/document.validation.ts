import { z } from "zod";
import { DocumentType } from "@/modules/documents/constant/document-type.enum.js";

export const uploadDocumentSchema = z.object({
  body: z.object({
    claimId: z.string().trim().min(1),
    documentType: z.nativeEnum(DocumentType),
    remarks: z.string().optional(),
    uploadedBy: z.string().trim().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const getDocumentsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    claimId: z.string().trim().min(1),
  }),
  params: z.object({}).optional(),
});
