import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { CommunicationController } from "@/modules/communications/controller/communication.controller.js";
import {
  createCommunicationSchema,
  listCommunicationsSchema,
} from "@/modules/communications/validation/communication.validation.js";
import { authenticate } from "@/modules/auth/middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createCommunicationSchema),
  asyncHandler(CommunicationController.createCommunication)
);
router.get(
  "/",
  authenticate,
  validate(listCommunicationsSchema),
  asyncHandler(CommunicationController.listCommunications)
);

export default router;
