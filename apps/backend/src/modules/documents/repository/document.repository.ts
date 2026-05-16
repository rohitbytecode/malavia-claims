import { DocumentModel } from "@/modules/documents/schema/document.schema.js";
import { DocumentDocument } from "@/modules/documents/types/document.types.js";

export class DocumentRepository {
  static async createDocument(payload: Partial<DocumentDocument>) {
    return DocumentModel.create(payload);
  }

  static async findLatestVersion(claimId: string, documentType: string) {
    return DocumentModel.findOne({ claimId, documentType })
      .sort({ version: -1 })
      .lean();
  }

  static async listDocumentsByClaim(claimId: string) {
    return DocumentModel.find({ claimId })
      .sort({ version: -1, createdAt: -1 })
      .lean();
  }
}
