import { Router } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { validate } from "@/middleware/zod.middleware.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";
import { allowRoles } from "@/middleware/permission.middleware.js";
import { Roles } from "@/core/enums/roles.enum.js";
import { AdvancedNotificationController } from "../controller/advanced-notification.controller.js";
import { updateAdvancedNotificationSchema } from "../validation/advanced-notification.validation.js";

const router = Router();

router.get(
  "/",
  authenticate,
  allowRoles(Roles.SUPER_ADMIN),
  asyncHandler(AdvancedNotificationController.getSettings)
);
router.put(
  "/",
  authenticate,
  allowRoles(Roles.SUPER_ADMIN),
  validate(updateAdvancedNotificationSchema),
  asyncHandler(AdvancedNotificationController.saveSettings)
);

export default router;
