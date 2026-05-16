import { DocumentDocument } from "@/modules/documents/types/document.types.js";

export const toDocumentResponse = (document: Partial<DocumentDocument>) => {
  return {
    id: document._id?.toString() ?? null,
    claimId: document.claimId?.toString() ?? null,
    documentType: document.documentType,
    fileName: document.fileName,
    originalName: document.originalName,
    mimeType: document.mimeType,
    filePath: document.filePath,
    uploadedBy: document.uploadedBy?.toString() ?? null,
    remarks: document.remarks,
    version: document.version,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
};
