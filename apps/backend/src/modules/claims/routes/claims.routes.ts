import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { ClaimController } from "@/modules/claims/controller/claim.controller.js";
import {
  createClaimSchema,
  getClaimParamsSchema,
  listClaimsSchema,
  transitionClaimStatusSchema,
  updateBillBreakdownSchema,
} from "@/modules/claims/validation/claim.validation.js";
import {
  authenticate,
  excludeRoles,
} from "@/modules/auth/middleware/auth.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";

const router = Router();

router.post("/", authenticate, excludeRoles(Roles.PHARMACIST), validate(createClaimSchema), ClaimController.createClaim);
router.get("/", authenticate, validate(listClaimsSchema), ClaimController.listClaims);
router.get(
  "/:claimId",
  authenticate,
  validate(getClaimParamsSchema),
  ClaimController.getClaimById
);
router.post(
  "/:claimId/status-transition",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(transitionClaimStatusSchema),
  ClaimController.transitionClaimStatus
);
router.get(
  "/:claimId/history",
  authenticate,
  validate(getClaimParamsSchema),
  ClaimController.getClaimHistory
);
router.patch(
  "/:claimId/bill-breakdown",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(updateBillBreakdownSchema),
  ClaimController.updateBillBreakdown
);

export default router;
