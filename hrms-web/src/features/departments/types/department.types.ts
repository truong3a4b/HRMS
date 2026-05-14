import type { Employee } from "../../employees/types/employee.types";

export type Department = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  manager?: Employee | null;
  managerId?: string | null;
  employeeCount?: number | null;
};

export type DepartmentFormPayload = {
  name: string;
  description?: string;
  managerId?: string | null;
};

export type UpdateDepartmentPayload = {
  name?: string;
  description?: string | null;
};
