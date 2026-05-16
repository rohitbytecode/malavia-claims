import { DepartmentDocument } from "@/modules/departments/types/department.types.js";

export const toDepartmentResponse = (
  department: Partial<DepartmentDocument>,
) => {
  return {
    id: department._id?.toString() ?? null,
    name: department.name,
    code: department.code,
    description: department.description,
    isActive: department.isActive,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
};
