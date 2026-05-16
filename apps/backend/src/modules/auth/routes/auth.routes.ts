import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { AuthController } from "@/modules/auth/controller/auth.controller.js";
import {
  loginSchema,
  refreshTokenSchema,
} from "@/modules/auth/validation/auth.validation.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login),
);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(AuthController.refreshToken),
);

export default router;
