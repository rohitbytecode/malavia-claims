import { Request, Response } from "express";
import { CommunicationService } from "@/modules/communications/service/communication.service.js";

export class CommunicationController {
  static async createCommunication(req: Request, res: Response) {
    const communication = await CommunicationService.createCommunication(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Communication recorded successfully",
      data: communication,
    });
  }

  static async listCommunications(req: Request, res: Response) {
    const { claimId, medium, followUpBefore, followUpAfter, page, limit } =
      req.query as {
        claimId: string;
        medium?: string;
        followUpBefore?: string;
        followUpAfter?: string;
        page?: string;
        limit?: string;
      };

    const communications = await CommunicationService.listCommunicationsByClaim(
      claimId,
      medium,
      followUpBefore,
      followUpAfter,
      Number(page ?? 1),
      Number(limit ?? 20)
    );

    return res.status(200).json({
      success: true,
      message: "Communications listed successfully",
      data: communications,
    });
  }
}
