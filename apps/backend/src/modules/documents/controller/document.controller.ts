import { Request, Response } from "express";
import { DocumentService } from "@/modules/documents/service/document.service.js";

export class DocumentController {
  static async uploadDocument(req: Request, res: Response) {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const payload = {
      claimId: req.body.claimId,
      documentType: req.body.documentType,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      filePath: file.path,
      uploadedBy: req.body.uploadedBy,
      remarks: req.body.remarks,
    };

    const document = await DocumentService.uploadDocument(payload);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  }

  static async listDocuments(req: Request, res: Response) {
    const { claimId } = req.query as { claimId: string };

    const documents = await DocumentService.listDocumentsByClaim(claimId);

    return res.status(200).json({
      success: true,
      message: "Documents listed successfully",
      data: documents,
    });
  }
}
