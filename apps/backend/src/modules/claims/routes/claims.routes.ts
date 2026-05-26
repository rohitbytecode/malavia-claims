import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { allowRoles } from "@/middleware/permission.middleware.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";
import { ClaimController } from "@/modules/claims/controller/claim.controller.js";
import {
  createClaimSchema,
  getClaimParamsSchema,
  listClaimsSchema,
  transitionClaimStatusSchema,
  updateBillBreakdownSchema,
} from "@/modules/claims/validation/claim.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  validate(createClaimSchema),
  ClaimController.createClaim
);
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
  validate(updateBillBreakdownSchema),
  ClaimController.updateBillBreakdown
);

export default router;
