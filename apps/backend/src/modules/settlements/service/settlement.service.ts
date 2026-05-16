import { Types } from "mongoose";
import { SettlementRepository } from "../repository/settlement.repository.js";
import { SettlementMethod } from "../constant/settlement-method.enum.js";
import { AuditLogService } from "@/modules/audit-logs/service/audit-log.service.js";
import { AuditModule } from "@/modules/audit-logs/constant/audit-module.enum.js";
import { AuditAction } from "@/modules/audit-logs/constant/audit-action.enum.js";
import { AppError } from "@/core/errors/AppError.js";

interface CreateSettlementParams {
  claimId: string;
  approvedAmount: number;
  hospitalDiscount?: number;
  deductions?: number;
  tds?: number;
  settlementMethod: SettlementMethod;
  remarks?: string;
  settledBy: string;
}

export class SettlementService {
  static async createSettlement(params: CreateSettlementParams) {
    const existing = await SettlementRepository.findSettlementByClaimId(params.claimId);
    if (existing) {
      throw new AppError("Settlement already exists for this claim", 400);
    }

    // Server-side safe calculation of netPayable
    const hospitalDiscount = params.hospitalDiscount ?? 0;
    const deductions = params.deductions ?? 0;
    const tds = params.tds ?? 0;

    const netPayable = params.approvedAmount - hospitalDiscount - deductions - tds;

    if (netPayable < 0) {
      throw new AppError("Net payable amount cannot be negative", 400);
    }

    const settlementPayload = {
      claimId: new Types.ObjectId(params.claimId),
      approvedAmount: params.approvedAmount,
      hospitalDiscount,
      deductions,
      tds,
      netPayable,
      settlementMethod: params.settlementMethod,
      remarks: params.remarks ? [params.remarks] : [],
      settledBy: new Types.ObjectId(params.settledBy),
    };

    const settlement = await SettlementRepository.createSettlement(settlementPayload as any);

    await AuditLogService.logAction({
      module: AuditModule.SETTLEMENTS,
      entityId: settlement._id.toString(),
      action: AuditAction.CREATE,
      performedBy: params.settledBy,
      newData: settlement.toObject(),
    });

    return settlement;
  }

  static async getSettlementByClaimId(claimId: string) {
    const settlement = await SettlementRepository.findSettlementByClaimId(claimId);
    if (!settlement) {
      throw new AppError("Settlement not found for this claim", 404);
    }
    return settlement;
  }
}
