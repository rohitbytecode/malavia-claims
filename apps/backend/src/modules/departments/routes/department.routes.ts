import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { DepartmentController } from "@/modules/departments/controller/department.controller.js";
import {
  createDepartmentSchema,
  listDepartmentsSchema,
  departmentIdParamsSchema,
  updateDepartmentSchema,
} from "@/modules/departments/validation/department.validation.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createDepartmentSchema),
  asyncHandler(DepartmentController.createDepartment),
);
router.get(
  "/",
  authenticate,
  validate(listDepartmentsSchema),
  asyncHandler(DepartmentController.listDepartments),
);
router.get(
  "/:departmentId",
  authenticate,
  validate(departmentIdParamsSchema),
  asyncHandler(DepartmentController.getDepartment),
);
router.patch(
  "/:departmentId",
  authenticate,
  validate(updateDepartmentSchema),
  asyncHandler(DepartmentController.updateDepartment),
);
router.delete(
  "/:departmentId",
  authenticate,
  validate(departmentIdParamsSchema),
  asyncHandler(DepartmentController.deleteDepartment),
);

export default router;
