import { Router } from "express";
import { validate } from "@/middleware/zod.middleware.js";
import { AuditLogController } from "../controller/audit-log.controller.js";
import {
  getEntityLogsSchema,
  getModuleLogsSchema,
} from "../validation/audit-log.validation.js";

const router = Router();

router.get(
  "/entity/:entityId",
  validate(getEntityLogsSchema),
  AuditLogController.getEntityLogs,
);

router.get(
  "/module/:module",
  validate(getModuleLogsSchema),
  AuditLogController.getModuleLogs,
);

export default router;
