import { InsuranceCompanyDocument } from "@/modules/insurance-companies/types/insurance-company.types.js";

export const toInsuranceCompanyResponse = (
  company: Partial<InsuranceCompanyDocument>
) => {
  return {
    id: company._id?.toString() ?? null,
    name: company.name,
    submissionMethods: company.submissionMethods,
    portalUrl: company.portalUrl,
    portalUsername: company.portalUsername,
    email: company.email,
    courierAddress: company.courierAddress,
    tatDays: company.tatDays,
    contactPersons: company.contactPersons,
    escalationMatrix: company.escalationMatrix,
    remarks: company.remarks,
    isActive: company.isActive,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
};
