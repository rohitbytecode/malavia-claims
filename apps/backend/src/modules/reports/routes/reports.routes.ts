import { Router } from "express";
import { ReportController } from "../controller/report.controller.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";
import { allowRoles } from "@/middleware/permission.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";

const router = Router();

router.get(
  "/patient-claims/:patientId",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  ReportController.getPatientClaimSummary
);
router.get(
  "/insurance-performance",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  ReportController.getInsurancePerformance
);
router.get(
  "/monthly",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  ReportController.getMonthlyReport
);
router.get(
  "/settlement-report",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  ReportController.getSettlementReport
);
router.get(
  "/hospital-share-report",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  ReportController.getHospitalShareReport
);

export default router;
