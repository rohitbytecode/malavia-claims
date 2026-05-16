import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { SettlementController } from "../controller/settlement.controller.js";
import {
  createSettlementSchema,
  getSettlementByClaimSchema,
} from "../validation/settlement.validation.js";

const router = Router();

router.post(
  "/",
  validate(createSettlementSchema),
  SettlementController.createSettlement
);

router.get(
  "/claim/:claimId",
  validate(getSettlementByClaimSchema),
  SettlementController.getSettlementByClaimId
);

export default router;
