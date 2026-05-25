import { ClaimModel } from "@/modules/claims/schema/claim.schema.js";
import { ClaimStatusHistoryModel } from "@/modules/claims/schema/claim-status-history.schema.js";
import { ClaimStatus } from "@/modules/claims/constant/claim-status.enum.js";
import { AlertService } from "@/modules/alerts/service/alert.service.js";
import { AlertType } from "@/modules/alerts/constant/alert-type.enum.js";
import { AlertSeverity } from "@/modules/alerts/constant/alert-severity.enum.js";
import { DepositModel } from "@/modules/deposits/schema/deposit.schema.js";
import { RefundStatus } from "@/modules/deposits/constant/refund-status.enum.js";
import { logger } from "@/config/logger.js";

export const checkCourierDelays = async () => {
  const now = new Date();

  // Find all claims currently in SETTLEMENT_PENDING stage
  const pendingClaims = await ClaimModel.find({
    status: ClaimStatus.SETTLEMENT_PENDING,
  }).lean();

  for (const claim of pendingClaims) {
    // Find when the claim transitioned to SETTLEMENT_PENDING
    const history = await ClaimStatusHistoryModel.findOne({
      claimId: claim._id,
      toStatus: ClaimStatus.SETTLEMENT_PENDING,
    })
      .sort({ effectiveAt: -1 })
      .lean();

    const transitionDate = history
      ? new Date(history.effectiveAt || history.createdAt)
      : new Date(claim.createdAt);

    const diffMs = now.getTime() - transitionDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays >= 90) {
      await AlertService.createAlert({
        claimId: claim._id.toString(),
        type: AlertType.COURIER_DELAY,
        severity: AlertSeverity.CRITICAL,
        message: `Claim ${claim.claimNumber} is critically delayed (>90 days in Settlement Pending)`,
      });
    } else if (diffDays >= 60) {
      await AlertService.createAlert({
        claimId: claim._id.toString(),
        type: AlertType.COURIER_DELAY,
        severity: AlertSeverity.CRITICAL,
        message: `Claim ${claim.claimNumber} is severely delayed (>60 days in Settlement Pending)`,
      });
    } else if (diffDays >= 45) {
      await AlertService.createAlert({
        claimId: claim._id.toString(),
        type: AlertType.COURIER_DELAY,
        severity: AlertSeverity.HIGH,
        message: `Claim ${claim.claimNumber} is delayed (>45 days in Settlement Pending)`,
      });
    }
  }
};

export const checkPendingSettlements = async () => {
  const pendingClaims = await ClaimModel.find({
    status: ClaimStatus.SETTLEMENT_PENDING,
  }).lean();

  for (const claim of pendingClaims) {
    await AlertService.createAlert({
      claimId: claim._id.toString(),
      type: AlertType.SETTLEMENT_PENDING,
      severity: AlertSeverity.MEDIUM,
      message: `Claim ${claim.claimNumber} is pending settlement`,
    });
  }
};

export const checkPendingRefunds = async () => {
  const pendingDeposits = await DepositModel.find({
    refundStatus: RefundStatus.PENDING,
  })
    .populate("claimId")
    .lean();

  for (const deposit of pendingDeposits) {
    if (deposit.claimId) {
      await AlertService.createAlert({
        claimId: (deposit.claimId as any)._id.toString(),
        type: AlertType.DEPOSIT_MISMATCH, // Repurposing or could create REFUND_PENDING type
        severity: AlertSeverity.MEDIUM,
        message: `Refund pending for collected amount ${deposit.collectedAmount}`,
      });
    }
  }
};
