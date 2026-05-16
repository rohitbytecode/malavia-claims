import { Request, Response } from "express";
import { DepartmentService } from "@/modules/departments/service/department.service.js";

export class DepartmentController {
  static async createDepartment(req: Request, res: Response) {
    const department = await DepartmentService.createDepartment(req.body);

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  }

  static async listDepartments(req: Request, res: Response) {
    const { isActive, page, limit } = req.query as {
      isActive?: string;
      page?: string;
      limit?: string;
    };

    const departments = await DepartmentService.listDepartments(
      isActive === undefined ? undefined : isActive === "true",
      Number(page ?? 1),
      Number(limit ?? 20)
    );

    return res.status(200).json({
      success: true,
      message: "Departments listed successfully",
      data: departments,
    });
  }

  static async getDepartment(req: Request, res: Response) {
    const departmentId = Array.isArray(req.params.departmentId)
      ? req.params.departmentId[0]
      : req.params.departmentId;

    const department = await DepartmentService.getDepartmentById(departmentId);

    return res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      data: department,
    });
  }

  static async updateDepartment(req: Request, res: Response) {
    const departmentId = Array.isArray(req.params.departmentId)
      ? req.params.departmentId[0]
      : req.params.departmentId;

    const department = await DepartmentService.updateDepartment(
      departmentId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  }

  static async deleteDepartment(req: Request, res: Response) {
    const departmentId = Array.isArray(req.params.departmentId)
      ? req.params.departmentId[0]
      : req.params.departmentId;

    const department = await DepartmentService.deleteDepartment(departmentId);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      data: department,
    });
  }
}
