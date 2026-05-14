export type PermissionKey =
  | "POSITION_SETUP"
  | "POSITION_VIEW"
  | "RECRUITMENT_MANAGE_JOB"
  | "RECRUITMENT_VIEW_APPLICATION"
  | "RECRUITMENT_MANAGE_APPLICATION"
  | "RECRUITMENT_APPROVE_DIRECT"
  | "DEPARTMENT_VIEW"
  | "DEPARTMENT_SETUP"
  | "EMPLOYEE_VIEW_LIST"
  | "EMPLOYEE_VIEW_DETAIL"
  | "EMPLOYEE_CREATE"
  | "EMPLOYEE_UPDATE_BASIC"
  | "EMPLOYEE_UPDATE_JOB"
  | "EMPLOYEE_UPDATE_SELF_BASIC"
  | "WORK_SCHEDULE_MANAGE"
  | "WORK_SCHEDULE_REGISTER"
  | "WORK_SCHEDULE_VIEW"
  | "ATTENDANCE_DEVICE_VIEW"
  | "ATTENDANCE_DEVICE_SETUP"
  | "ATTENDANCE_HISTORY_VIEW"
  | "ATTENDANCE_TIMESHEET_VIEW"
  | "PAYROLL_POLICY_VIEW"
  | "PAYROLL_POLICY_SETUP"
  | "PAYROLL_VIEW"
  | "PAYROLL_MANAGE"
  | "PAYROLL_APPROVE"
  | "PAYROLL_PAY"
  | "PAYROLL_VIEW_SELF";

export type PermissionCatalogItem = {
  id?: string;
  key: PermissionKey;
  name: string;
  description?: string;
};

export type PositionPermissionRelation = {
  permission?: PermissionCatalogItem;
};

export type Position = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  permissions?: PermissionKey[] | PositionPermissionRelation[];
};

export type PositionPayload = {
  name: string;
  code?: string;
  description?: string;
  permissionKeys: PermissionKey[];
};
