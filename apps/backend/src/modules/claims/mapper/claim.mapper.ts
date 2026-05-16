import {
  ClaimDocument,
  ClaimStatusHistoryDocument,
} from "@/modules/claims/types/claim.types.js";

export const toClaimResponse = (claim: ClaimDocument) => {
  const claimObject = claim.toObject();

  return {
    id: claimObject._id.toString(),
    claimNumber: claimObject.claimNumber,
    type: claimObject.type,
    status: claimObject.status,
    insuranceCompanyId: claimObject.insuranceCompanyId?.toString() ?? null,
    patientId: claimObject.patientId.toString(),
    hospitalId: claimObject.hospitalId.toString(),
    departmentId: claimObject.departmentId?.toString() ?? null,
    totalClaimAmount: claimObject.totalClaimAmount,
    tdsAmount: claimObject.tdsAmount,
    deductions: claimObject.deductions,
    hospitalDiscount: claimObject.hospitalDiscount,
    depositAmount: claimObject.depositAmount,
    refundAmount: claimObject.refundAmount,
    remarks: claimObject.remarks,
    createdBy: claimObject.createdBy?.toString() ?? null,
    updatedBy: claimObject.updatedBy?.toString() ?? null,
    createdAt: claimObject.createdAt,
    updatedAt: claimObject.updatedAt,
  };
};

export const toClaimStatusHistoryResponse = (
  entry: ClaimStatusHistoryDocument
) => {
  const historyObject = entry.toObject();

  return {
    id: historyObject._id.toString(),
    claimId: historyObject.claimId.toString(),
    fromStatus: historyObject.fromStatus,
    toStatus: historyObject.toStatus,
    remarks: historyObject.remarks,
    changedBy: historyObject.changedBy?.toString() ?? null,
    effectiveAt: historyObject.effectiveAt,
    createdAt: historyObject.createdAt,
    updatedAt: historyObject.updatedAt,
  };
};
