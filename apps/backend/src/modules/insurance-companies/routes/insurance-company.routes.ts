import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { InsuranceCompanyController } from "@/modules/insurance-companies/controller/insurance-company.controller.js";
import {
  createInsuranceCompanySchema,
  listInsuranceCompaniesSchema,
  companyIdParamsSchema,
  updateInsuranceCompanySchema,
} from "@/modules/insurance-companies/validation/insurance-company.validation.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createInsuranceCompanySchema),
  asyncHandler(InsuranceCompanyController.createInsuranceCompany),
);
router.get(
  "/",
  authenticate,
  validate(listInsuranceCompaniesSchema),
  asyncHandler(InsuranceCompanyController.listInsuranceCompanies),
);
router.get(
  "/:companyId",
  authenticate,
  validate(companyIdParamsSchema),
  asyncHandler(InsuranceCompanyController.getInsuranceCompany),
);
router.patch(
  "/:companyId",
  authenticate,
  validate(updateInsuranceCompanySchema),
  asyncHandler(InsuranceCompanyController.updateInsuranceCompany),
);
router.delete(
  "/:companyId",
  authenticate,
  validate(companyIdParamsSchema),
  asyncHandler(InsuranceCompanyController.deleteInsuranceCompany),
);

export default router;
