import { Request, Response } from "express";
import { InsuranceCompanyService } from "@/modules/insurance-companies/service/insurance-company.service.js";

export class InsuranceCompanyController {
  static async createInsuranceCompany(req: Request, res: Response) {
    const company = await InsuranceCompanyService.createInsuranceCompany(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Insurance company created successfully",
      data: company,
    });
  }

  static async listInsuranceCompanies(req: Request, res: Response) {
    const { isActive, page, limit } = req.query as {
      isActive?: string;
      page?: string;
      limit?: string;
    };

    const companies = await InsuranceCompanyService.listInsuranceCompanies(
      isActive === undefined ? undefined : isActive === "true",
      Number(page ?? 1),
      Number(limit ?? 20)
    );

    return res.status(200).json({
      success: true,
      message: "Insurance companies listed successfully",
      data: companies,
    });
  }

  static async getInsuranceCompany(req: Request, res: Response) {
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;

    const company =
      await InsuranceCompanyService.getInsuranceCompanyById(companyId);

    return res.status(200).json({
      success: true,
      message: "Insurance company fetched successfully",
      data: company,
    });
  }

  static async updateInsuranceCompany(req: Request, res: Response) {
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;

    const company = await InsuranceCompanyService.updateInsuranceCompany(
      companyId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Insurance company updated successfully",
      data: company,
    });
  }

  static async deleteInsuranceCompany(req: Request, res: Response) {
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;

    const company =
      await InsuranceCompanyService.deleteInsuranceCompany(companyId);

    return res.status(200).json({
      success: true,
      message: "Insurance company deleted successfully",
      data: company,
    });
  }
}
