import { Request, Response } from "express";
import { TimelineService } from "../service/timeline.service.js";

export class TimelineController {
  static async getClaimTimeline(req: Request, res: Response) {
    const { claimId } = req.params;
    const timeline = await TimelineService.getClaimTimeline(claimId as string);

    return res.status(200).json({
      success: true,
      message: "Claim timeline fetched successfully",
      data: timeline,
    });
  }
}
