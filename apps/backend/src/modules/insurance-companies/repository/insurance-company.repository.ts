import { InsuranceCompanyModel } from "@/modules/insurance-companies/schema/insurance-company.schema.js";
import { InsuranceCompanyDocument } from "@/modules/insurance-companies/types/insurance-company.types.js";

interface InsuranceCompanyFilters {
  isActive?: boolean;
}

export class InsuranceCompanyRepository {
  static async createInsuranceCompany(
    payload: Partial<InsuranceCompanyDocument>
  ) {
    return InsuranceCompanyModel.create(payload);
  }

  static async findById(companyId: string) {
    return InsuranceCompanyModel.findById(companyId).lean();
  }

  static async findByName(name: string) {
    return InsuranceCompanyModel.findOne({ name: name.trim() });
  }

  static async listInsuranceCompanies(
    filters: InsuranceCompanyFilters,
    page: number,
    limit: number
  ) {
    const query: Record<string, unknown> = {};

    if (typeof filters.isActive === "boolean") {
      query.isActive = filters.isActive;
    }

    return InsuranceCompanyModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  static async updateInsuranceCompany(
    companyId: string,
    update: Partial<InsuranceCompanyDocument>
  ) {
    return InsuranceCompanyModel.findByIdAndUpdate(companyId, update, {
      new: true,
    }).lean();
  }

  static async deleteInsuranceCompany(companyId: string) {
    return InsuranceCompanyModel.findByIdAndDelete(companyId).lean();
  }
}
