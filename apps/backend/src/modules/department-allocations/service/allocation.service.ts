import { AllocationRepository } from "../repository/allocation.repository.js";
import { AppError } from "@/core/errors/AppError.js";
import { SettlementRepository } from "@/modules/settlements/repository/settlement.repository.js";
import { AuditLogService } from "@/modules/audit-logs/service/audit-log.service.js";
import { AuditModule } from "@/modules/audit-logs/constant/audit-module.enum.js";
import { AuditAction } from "@/modules/audit-logs/constant/audit-action.enum.js";

interface AllocationItem {
  departmentId: string;
  amount: number;
  remarks?: string;
}

interface CreateAllocationsParams {
  settlementId: string;
  allocations: AllocationItem[];
  allocatedBy: string;
}

export class AllocationService {
  static async allocateAmount(params: CreateAllocationsParams) {
    const settlement = await SettlementRepository.findSettlementById(params.settlementId);
    if (!settlement) {
      throw new AppError("Settlement not found", 404);
    }

    const currentTotalAllocated = await AllocationRepository.getTotalAllocatedAmount(params.settlementId);
    
    const newAllocationTotal = params.allocations.reduce((sum, item) => sum + item.amount, 0);

    if (currentTotalAllocated + newAllocationTotal > settlement.approvedAmount) {
      throw new AppError(
        `Total allocation exceeds settlement approved amount. Approved: ${settlement.approvedAmount}`,
        400
      );
    }

    const payloads = params.allocations.map((a) => ({
      ...a,
      settlementId: params.settlementId,
    }));

    const result = await AllocationRepository.createAllocations(payloads);

    await AuditLogService.logAction({
      module: AuditModule.DEPARTMENT_ALLOCATIONS,
      entityId: params.settlementId,
      action: AuditAction.CREATE,
      performedBy: params.allocatedBy,
      newData: { allocationsCount: result.length, newAllocationTotal },
    });

    return result;
  }

  static async getAllocationsBySettlement(settlementId: string) {
    return AllocationRepository.getAllocationsBySettlement(settlementId);
  }
}
