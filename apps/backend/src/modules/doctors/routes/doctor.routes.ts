import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { DoctorController } from "@/modules/doctors/controller/doctor.controller.js";
import {
  createDoctorSchema,
  listDoctorsSchema,
  doctorIdParamsSchema,
  updateDoctorSchema,
} from "@/modules/doctors/validation/doctor.validation.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createDoctorSchema),
  asyncHandler(DoctorController.createDoctor)
);
router.get(
  "/",
  authenticate,
  validate(listDoctorsSchema),
  asyncHandler(DoctorController.listDoctors)
);
router.get(
  "/:doctorId",
  authenticate,
  validate(doctorIdParamsSchema),
  asyncHandler(DoctorController.getDoctor)
);
router.patch(
  "/:doctorId",
  authenticate,
  validate(updateDoctorSchema),
  asyncHandler(DoctorController.updateDoctor)
);
router.delete(
  "/:doctorId",
  authenticate,
  validate(doctorIdParamsSchema),
  asyncHandler(DoctorController.deleteDoctor)
);

export default router;
