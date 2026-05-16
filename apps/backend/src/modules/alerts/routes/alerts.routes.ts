import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { AlertController } from "../controller/alert.controller.js";
import {
  listActiveAlertsSchema,
  getAlertsByClaimSchema,
  resolveAlertSchema,
} from "../validation/alert.validation.js";

const router = Router();

router.get(
  "/active",
  validate(listActiveAlertsSchema),
  AlertController.listActiveAlerts
);

router.get(
  "/claim/:claimId",
  validate(getAlertsByClaimSchema),
  AlertController.getAlertsByClaim
);

router.patch(
  "/:alertId/resolve",
  validate(resolveAlertSchema),
  AlertController.resolveAlert
);

export default router;
