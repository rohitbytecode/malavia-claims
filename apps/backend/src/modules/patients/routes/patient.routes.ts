import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { PatientController } from "@/modules/patients/controller/patient.controller.js";
import {
  createPatientSchema,
  listPatientsSchema,
  patientIdParamsSchema,
  updatePatientSchema,
} from "@/modules/patients/validation/patient.validation.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";
import { allowRoles } from "@/middleware/permission.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";

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
  validate(createPatientSchema),
  asyncHandler(PatientController.createPatient)
);
router.get(
  "/",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  validate(listPatientsSchema),
  asyncHandler(PatientController.listPatients)
);
router.get(
  "/:patientId",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  validate(patientIdParamsSchema),
  asyncHandler(PatientController.getPatient)
);
router.patch(
  "/:patientId",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  validate(updatePatientSchema),
  asyncHandler(PatientController.updatePatient)
);
router.delete(
  "/:patientId",
  authenticate,
  allowRoles(
    Roles.SUPER_ADMIN,
    Roles.ADMIN,
    Roles.CLAIM_MANAGER,
    Roles.CLAIM_EXECUTIVE,
    Roles.ACCOUNTANT
  ),
  validate(patientIdParamsSchema),
  asyncHandler(PatientController.deletePatient)
);

export default router;
