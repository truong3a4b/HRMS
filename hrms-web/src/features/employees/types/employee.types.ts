export type EmployeeStatus = "WORKING" | "ON_LEAVE" | "RESIGNED";

export type EmployeeOption = {
  id: string;
  name: string;
};

export type UpdateEmployeeAdditionalPayload = {
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
};

export type UpdateEmployeeBasicPayload = {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  bankAccount?: string | null;
  bank?: EmployeeOption | Record<string, unknown> | null;
  province?: EmployeeOption | Record<string, unknown> | null;
  ward?: EmployeeOption | Record<string, unknown> | null;
};

export type Employee = {
  id: string;
  employeeId: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  } | null;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: EmployeeStatus;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  bankAccount?: string | null;
  bank?: EmployeeOption | Record<string, unknown> | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
  province?: EmployeeOption | Record<string, unknown> | null;
  ward?: EmployeeOption | Record<string, unknown> | null;
  department?: EmployeeOption | null;
  position?: EmployeeOption | null;
  departmentId?: string | null;
  positionId?: string | null;
  hireDate?: string | null;
  salary?: string | number | null;
};

export type EmployeeFilters = {
  search?: string;
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  page: number;
  limit: number;
};

export type EmployeeListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EmployeeListData = {
  items: Employee[];
  meta: EmployeeListMeta;
};

export type CreateEmployeePayload = {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  bankAccount?: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  salary: number;
};

export type UpdateEmployeeJobPayload = {
  departmentId: string;
  positionId: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
  effectiveFrom: string;
};
