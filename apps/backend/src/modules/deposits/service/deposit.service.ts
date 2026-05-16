import { Types } from "mongoose";
import { DepositRepository } from "../repository/deposit.repository.js";
import { RefundMode } from "../constant/refund-mode.enum.js";
import { RefundStatus } from "../constant/refund-status.enum.js";
import { AppError } from "@/core/errors/AppError.js";
import { AuditLogService } from "@/modules/audit-logs/service/audit-log.service.js";
import { AuditModule } from "@/modules/audit-logs/constant/audit-module.enum.js";
import { AuditAction } from "@/modules/audit-logs/constant/audit-action.enum.js";
import { AlertService } from "@/modules/alerts/service/alert.service.js";
import { AlertType } from "@/modules/alerts/constant/alert-type.enum.js";
import { AlertSeverity } from "@/modules/alerts/constant/alert-severity.enum.js";

interface CreateDepositParams {
  claimId: string;
  collectedAmount: number;
  remarks?: string;
  createdBy: string;
}

interface UpdateRefundParams {
  refundAmount: number;
  refundMode: RefundMode;
  remarks?: string;
  updatedBy: string;
}

export class DepositService {
  static async createDeposit(params: CreateDepositParams) {
    const existing = await DepositRepository.findDepositByClaimId(
      params.claimId
    );
    if (existing) {
      throw new AppError("Deposit record already exists for this claim", 400);
    }

    const payload = {
      claimId: new Types.ObjectId(params.claimId),
      collectedAmount: params.collectedAmount,
      refundAmount: 0,
      refundStatus: RefundStatus.PENDING,
      remarks: params.remarks,
    };

    const deposit = await DepositRepository.createDeposit(payload as any);

    await AuditLogService.logAction({
      module: AuditModule.DEPOSITS,
      entityId: deposit._id.toString(),
      action: AuditAction.CREATE,
      performedBy: params.createdBy,
      newData: deposit.toObject(),
    });

    return deposit;
  }

  static async updateRefundStatus(
    depositId: string,
    params: UpdateRefundParams
  ) {
    const deposit = await DepositRepository.findDepositById(depositId);
    if (!deposit) {
      throw new AppError("Deposit record not found", 404);
    }

    if (deposit.refundStatus === RefundStatus.COMPLETED) {
      throw new AppError("Refund is already completed", 400);
    }

    const updates = {
      refundAmount: params.refundAmount,
      refundMode: params.refundMode,
      refundStatus: RefundStatus.COMPLETED,
      refundDate: new Date(),
      remarks: params.remarks,
    };

    const updatedDeposit = await DepositRepository.updateDeposit(
      depositId,
      updates as any
    );

    // Generate Alert if refund amount exceeds collected amount
    if (params.refundAmount > deposit.collectedAmount) {
      await AlertService.createAlert({
        claimId: deposit.claimId.toString(),
        type: AlertType.DEPOSIT_MISMATCH,
        severity: AlertSeverity.CRITICAL,
        message: `Refund amount (${params.refundAmount}) exceeds collected amount (${deposit.collectedAmount})`,
      });
    }

    await AuditLogService.logAction({
      module: AuditModule.DEPOSITS,
      entityId: depositId,
      action: AuditAction.UPDATE,
      performedBy: params.updatedBy,
      previousData: deposit.toObject(),
      newData: updatedDeposit!.toObject(),
    });

    return updatedDeposit;
  }

  static async getDepositByClaimId(claimId: string) {
    const deposit = await DepositRepository.findDepositByClaimId(claimId);
    if (!deposit) {
      throw new AppError("Deposit record not found for this claim", 404);
    }
    return deposit;
  }
}
