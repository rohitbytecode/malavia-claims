import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { UserController } from "@/modules/users/controller/user.controller.js";
import {
  createUserSchema,
  getUserParamsSchema,
  listUsersSchema,
  updateUserSchema,
} from "@/modules/users/validation/user.validation.js";

const router = Router();

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(UserController.createUser)
);
router.get(
  "/",
  validate(listUsersSchema),
  asyncHandler(UserController.listUsers)
);
router.get(
  "/:userId",
  validate(getUserParamsSchema),
  asyncHandler(UserController.getUser)
);
router.patch(
  "/:userId",
  validate(updateUserSchema),
  asyncHandler(UserController.updateUser)
);
router.patch(
  "/:userId/deactivate",
  validate(getUserParamsSchema),
  asyncHandler(UserController.deactivateUser)
);

export default router;
