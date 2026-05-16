import { DepartmentModel } from "@/modules/departments/schema/department.schema.js";
import { DepartmentDocument } from "@/modules/departments/types/department.types.js";

interface DepartmentFilters {
  isActive?: boolean;
}

export class DepartmentRepository {
  static async createDepartment(payload: Partial<DepartmentDocument>) {
    return DepartmentModel.create(payload);
  }

  static async findById(departmentId: string) {
    return DepartmentModel.findById(departmentId).lean();
  }

  static async listDepartments(
    filters: DepartmentFilters,
    page: number,
    limit: number,
  ) {
    const query: Record<string, unknown> = {};

    if (typeof filters.isActive === "boolean") {
      query.isActive = filters.isActive;
    }

    return DepartmentModel.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  static async updateDepartment(
    departmentId: string,
    update: Partial<DepartmentDocument>,
  ) {
    return DepartmentModel.findByIdAndUpdate(departmentId, update, {
      new: true,
    }).lean();
  }

  static async deleteDepartment(departmentId: string) {
    return DepartmentModel.findByIdAndDelete(departmentId).lean();
  }
}
