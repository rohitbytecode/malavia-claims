import { Request, Response } from "express";
import { AuditLogService } from "../service/audit-log.service.js";
import { AuditModule } from "../constant/audit-module.enum.js";

export class AuditLogController {
  static async getEntityLogs(req: Request, res: Response) {
    const { entityId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const logs = await AuditLogService.fetchEntityHistory(entityId as string, page, limit);

    return res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: logs,
    });
  }

  static async getModuleLogs(req: Request, res: Response) {
    const { module } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const logs = await AuditLogService.fetchModuleHistory(module as AuditModule, page, limit);

    return res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: logs,
    });
  }
}
