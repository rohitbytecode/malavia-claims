import { AppError } from "@/core/errors/AppError.js";
import { InsuranceCompanyRepository } from "@/modules/insurance-companies/repository/insurance-company.repository.js";
import { encryptPortalPassword } from "@/modules/insurance-companies/utils/encryption.util.js";
import { toInsuranceCompanyResponse } from "@/modules/insurance-companies/mapper/insurance-company.mapper.js";
import { InsuranceCompanyDocument } from "@/modules/insurance-companies/types/insurance-company.types.js";

import { SubmissionMethod } from "@/modules/insurance-companies/constant/submission-method.enum.js";

interface CreateInsuranceCompanyPayload {
  name: string;
  submissionMethods: SubmissionMethod[];
  portalUrl?: string;
  portalUsername?: string;
  portalPassword?: string;
  email?: string;
  courierAddress?: string;
  tatDays?: number;
  contactPersons?: any[];
  escalationMatrix?: any[];
  remarks?: string;
  isActive?: boolean;
}

interface UpdateInsuranceCompanyPayload extends Partial<CreateInsuranceCompanyPayload> {}

export class InsuranceCompanyService {
  static async createInsuranceCompany(payload: CreateInsuranceCompanyPayload) {
    const existingCompany = await InsuranceCompanyRepository.findByName(
      payload.name,
    );

    if (existingCompany) {
      throw new AppError("Insurance company already exists", 409);
    }

    const company = await InsuranceCompanyRepository.createInsuranceCompany({
      name: payload.name.trim(),
      submissionMethods: payload.submissionMethods,
      portalUrl: payload.portalUrl,
      portalUsername: payload.portalUsername,
      portalPasswordEncrypted: payload.portalPassword
        ? encryptPortalPassword(payload.portalPassword)
        : undefined,
      email: payload.email?.trim().toLowerCase(),
      courierAddress: payload.courierAddress,
      tatDays: payload.tatDays ?? 0,
      contactPersons: payload.contactPersons ?? [],
      escalationMatrix: payload.escalationMatrix ?? [],
      remarks: payload.remarks ?? "",
      isActive: payload.isActive ?? true,
    } as Partial<InsuranceCompanyDocument>);

    return toInsuranceCompanyResponse(company);
  }

  static async listInsuranceCompanies(
    isActive: boolean | undefined,
    page: number,
    limit: number,
  ) {
    const companies = await InsuranceCompanyRepository.listInsuranceCompanies(
      { isActive },
      page,
      limit,
    );

    return companies.map(toInsuranceCompanyResponse);
  }

  static async getInsuranceCompanyById(companyId: string) {
    const company = await InsuranceCompanyRepository.findById(companyId);

    if (!company) {
      throw new AppError("Insurance company not found", 404);
    }

    return toInsuranceCompanyResponse(company);
  }

  static async updateInsuranceCompany(
    companyId: string,
    payload: UpdateInsuranceCompanyPayload,
  ) {
    const updatePayload: Partial<InsuranceCompanyDocument> = {};

    if (payload.name) {
      updatePayload.name = payload.name.trim();
    }

    if (payload.submissionMethods) {
      updatePayload.submissionMethods = payload.submissionMethods;
    }

    if (payload.portalUrl) {
      updatePayload.portalUrl = payload.portalUrl;
    }

    if (payload.portalUsername) {
      updatePayload.portalUsername = payload.portalUsername;
    }

    if (payload.portalPassword) {
      updatePayload.portalPasswordEncrypted = encryptPortalPassword(
        payload.portalPassword,
      );
    }

    if (payload.email) {
      updatePayload.email = payload.email.trim().toLowerCase();
    }

    if (payload.courierAddress) {
      updatePayload.courierAddress = payload.courierAddress;
    }

    if (typeof payload.tatDays === "number") {
      updatePayload.tatDays = payload.tatDays;
    }

    if (payload.contactPersons) {
      updatePayload.contactPersons = payload.contactPersons;
    }

    if (payload.escalationMatrix) {
      updatePayload.escalationMatrix = payload.escalationMatrix;
    }

    if (payload.remarks !== undefined) {
      updatePayload.remarks = payload.remarks;
    }

    if (typeof payload.isActive === "boolean") {
      updatePayload.isActive = payload.isActive;
    }

    const company = await InsuranceCompanyRepository.updateInsuranceCompany(
      companyId,
      updatePayload,
    );

    if (!company) {
      throw new AppError("Insurance company not found", 404);
    }

    return toInsuranceCompanyResponse(company);
  }

  static async deleteInsuranceCompany(companyId: string) {
    const company =
      await InsuranceCompanyRepository.deleteInsuranceCompany(companyId);

    if (!company) {
      throw new AppError("Insurance company not found", 404);
    }

    return toInsuranceCompanyResponse(company);
  }
}
