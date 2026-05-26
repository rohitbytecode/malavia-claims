import { Router } from "express";
import { ReportController } from "../controller/report.controller.js";
import { authenticate, excludeRoles } from "@/modules/auth/middleware/auth.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";

const router = Router();

router.get(
  "/patient-claims/:patientId",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  ReportController.getPatientClaimSummary
);
router.get("/insurance-performance", authenticate, excludeRoles(Roles.PHARMACIST), ReportController.getInsurancePerformance);
router.get("/monthly", authenticate, ReportController.getMonthlyReport);
router.get("/settlement-report", authenticate, excludeRoles(Roles.PHARMACIST), ReportController.getSettlementReport);
router.get("/hospital-share-report", authenticate, excludeRoles(Roles.PHARMACIST), ReportController.getHospitalShareReport);

export default router;
