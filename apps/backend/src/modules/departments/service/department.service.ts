import { AppError } from "@/core/errors/AppError.js";
import { DepartmentRepository } from "@/modules/departments/repository/department.repository.js";
import { DepartmentDocument } from "@/modules/departments/types/department.types.js";
import { toDepartmentResponse } from "@/modules/departments/mapper/department.mapper.js";

interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {}

export class DepartmentService {
  static async createDepartment(payload: CreateDepartmentPayload) {
    const department = await DepartmentRepository.createDepartment({
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      description: payload.description ?? "",
      isActive: payload.isActive ?? true,
    } as Partial<DepartmentDocument>);

    return toDepartmentResponse(department);
  }

  static async listDepartments(
    isActive: boolean | undefined,
    page: number,
    limit: number,
  ) {
    const departments = await DepartmentRepository.listDepartments(
      { isActive },
      page,
      limit,
    );

    return departments.map(toDepartmentResponse);
  }

  static async getDepartmentById(departmentId: string) {
    const department = await DepartmentRepository.findById(departmentId);

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    return toDepartmentResponse(department);
  }

  static async updateDepartment(
    departmentId: string,
    payload: UpdateDepartmentPayload,
  ) {
    const updatePayload: Partial<DepartmentDocument> = {};

    if (payload.name) {
      updatePayload.name = payload.name.trim();
    }

    if (payload.code) {
      updatePayload.code = payload.code.trim().toUpperCase();
    }

    if (payload.description !== undefined) {
      updatePayload.description = payload.description;
    }

    if (typeof payload.isActive === "boolean") {
      updatePayload.isActive = payload.isActive;
    }

    const department = await DepartmentRepository.updateDepartment(
      departmentId,
      updatePayload,
    );

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    return toDepartmentResponse(department);
  }

  static async deleteDepartment(departmentId: string) {
    const department =
      await DepartmentRepository.deleteDepartment(departmentId);

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    return toDepartmentResponse(department);
  }
}
