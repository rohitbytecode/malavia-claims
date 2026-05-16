import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { DepositController } from "../controller/deposit.controller.js";
import {
  createDepositSchema,
  getDepositByClaimSchema,
  updateRefundSchema,
} from "../validation/deposit.validation.js";

const router = Router();

router.post(
  "/",
  validate(createDepositSchema),
  DepositController.createDeposit
);

router.get(
  "/claim/:claimId",
  validate(getDepositByClaimSchema),
  DepositController.getDepositByClaimId
);

router.patch(
  "/:depositId/refund",
  validate(updateRefundSchema),
  DepositController.updateRefundStatus
);

export default router;
