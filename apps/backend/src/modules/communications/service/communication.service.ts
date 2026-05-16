import { Types } from "mongoose";
import { AppError } from "@/core/errors/AppError.js";
import { CommunicationRepository } from "@/modules/communications/repository/communication.repository.js";
import { toCommunicationResponse } from "@/modules/communications/mapper/communication.mapper.js";
import { CommunicationDocument } from "@/modules/communications/types/communication.types.js";

interface CreateCommunicationPayload {
  claimId: string;
  type: string;
  medium: string;
  remarks?: string;
  followUpDate?: string;
  createdBy?: string;
}

export class CommunicationService {
  static async createCommunication(payload: CreateCommunicationPayload) {
    const communication = await CommunicationRepository.createCommunication({
      claimId: new Types.ObjectId(payload.claimId),
      type: payload.type,
      medium: payload.medium,
      remarks: payload.remarks ?? "",
      followUpDate: payload.followUpDate
        ? new Date(payload.followUpDate)
        : undefined,
      createdBy: payload.createdBy
        ? new Types.ObjectId(payload.createdBy)
        : undefined,
    } as Partial<CommunicationDocument>);

    return toCommunicationResponse(communication);
  }

  static async listCommunicationsByClaim(
    claimId: string,
    medium: string | undefined,
    followUpBefore: string | undefined,
    followUpAfter: string | undefined,
    page: number,
    limit: number
  ) {
    const communications =
      await CommunicationRepository.listCommunicationsByClaim(
        claimId,
        {
          medium,
          followUpBefore: followUpBefore ? new Date(followUpBefore) : undefined,
          followUpAfter: followUpAfter ? new Date(followUpAfter) : undefined,
        },
        page,
        limit
      );

    return communications.map(toCommunicationResponse);
  }
}
