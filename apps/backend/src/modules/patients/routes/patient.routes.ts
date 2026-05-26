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
import {
  authenticate,
  excludeRoles,
} from "@/modules/auth/middleware/auth.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";

const router = Router();

router.post(
  "/",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(createPatientSchema),
  asyncHandler(PatientController.createPatient)
);
router.get(
  "/",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(listPatientsSchema),
  asyncHandler(PatientController.listPatients)
);
router.get(
  "/:patientId",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(patientIdParamsSchema),
  asyncHandler(PatientController.getPatient)
);
router.patch(
  "/:patientId",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(updatePatientSchema),
  asyncHandler(PatientController.updatePatient)
);
router.delete(
  "/:patientId",
  authenticate,
  excludeRoles(Roles.PHARMACIST),
  validate(patientIdParamsSchema),
  asyncHandler(PatientController.deletePatient)
);

export default router;
