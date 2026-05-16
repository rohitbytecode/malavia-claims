import { CommunicationDocument } from "@/modules/communications/types/communication.types.js";

export const toCommunicationResponse = (
  communication: Partial<CommunicationDocument>
) => {
  return {
    id: communication._id?.toString() ?? null,
    claimId: communication.claimId?.toString() ?? null,
    type: communication.type,
    medium: communication.medium,
    remarks: communication.remarks,
    followUpDate: communication.followUpDate,
    createdBy: communication.createdBy?.toString() ?? null,
    createdAt: communication.createdAt,
    updatedAt: communication.updatedAt,
  };
};
