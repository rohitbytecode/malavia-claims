import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { AllocationController } from "../controller/allocation.controller.js";
import {
  createAllocationsSchema,
  getAllocationsBySettlementSchema,
} from "../validation/allocation.validation.js";

const router = Router();

router.post(
  "/",
  validate(createAllocationsSchema),
  AllocationController.createAllocations
);

router.get(
  "/settlement/:settlementId",
  validate(getAllocationsBySettlementSchema),
  AllocationController.getAllocationsBySettlement
);

export default router;
