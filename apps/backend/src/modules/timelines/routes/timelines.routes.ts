import { Router } from "express";
import { TimelineController } from "../controller/timeline.controller.js";

const router = Router();

router.get("/claim/:claimId", TimelineController.getClaimTimeline);

export default router;
