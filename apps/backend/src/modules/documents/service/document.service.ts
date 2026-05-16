import { Types } from "mongoose";
import { AppError } from "@/core/errors/AppError.js";
import { DocumentRepository } from "@/modules/documents/repository/document.repository.js";
import { toDocumentResponse } from "@/modules/documents/mapper/document.mapper.js";
import { DocumentDocument } from "@/modules/documents/types/document.types.js";

interface UploadDocumentPayload {
  claimId: string;
  documentType: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  uploadedBy?: string;
  remarks?: string;
}

export class DocumentService {
  static async uploadDocument(payload: UploadDocumentPayload) {
    const latest = await DocumentRepository.findLatestVersion(
      payload.claimId,
      payload.documentType
    );

    const version = latest?.version ? latest.version + 1 : 1;

    const document = await DocumentRepository.createDocument({
      claimId: new Types.ObjectId(payload.claimId),
      documentType: payload.documentType,
      fileName: payload.fileName,
      originalName: payload.originalName,
      mimeType: payload.mimeType,
      filePath: payload.filePath,
      uploadedBy: payload.uploadedBy
        ? new Types.ObjectId(payload.uploadedBy)
        : undefined,
      remarks: payload.remarks ?? "",
      version,
    } as Partial<DocumentDocument>);

    return toDocumentResponse(document);
  }

  static async listDocumentsByClaim(claimId: string) {
    const documents = await DocumentRepository.listDocumentsByClaim(claimId);

    return documents.map(toDocumentResponse);
  }
}
