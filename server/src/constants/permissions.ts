export const PERMISSIONS = {
  POSITION_SETUP: "POSITION_SETUP",
  POSITION_VIEW: "POSITION_VIEW",
  RECRUITMENT_MANAGE_JOB: "RECRUITMENT_MANAGE_JOB",
  RECRUITMENT_VIEW_APPLICATION: "RECRUITMENT_VIEW_APPLICATION",
  RECRUITMENT_MANAGE_APPLICATION: "RECRUITMENT_MANAGE_APPLICATION",
  RECRUITMENT_APPROVE_DIRECT: "RECRUITMENT_APPROVE_DIRECT",
  DEPARTMENT_VIEW: "DEPARTMENT_VIEW",
  DEPARTMENT_SETUP: "DEPARTMENT_SETUP",
  EMPLOYEE_VIEW_LIST: "EMPLOYEE_VIEW_LIST",
  EMPLOYEE_VIEW_DETAIL: "EMPLOYEE_VIEW_DETAIL",
  EMPLOYEE_CREATE: "EMPLOYEE_CREATE",
  EMPLOYEE_UPDATE_BASIC: "EMPLOYEE_UPDATE_BASIC",
  EMPLOYEE_UPDATE_JOB: "EMPLOYEE_UPDATE_JOB",
  EMPLOYEE_UPDATE_SELF_BASIC: "EMPLOYEE_UPDATE_SELF_BASIC",
  WORK_SCHEDULE_MANAGE: "WORK_SCHEDULE_MANAGE",
  WORK_SCHEDULE_REGISTER: "WORK_SCHEDULE_REGISTER",
  WORK_SCHEDULE_VIEW: "WORK_SCHEDULE_VIEW",
  ATTENDANCE_DEVICE_VIEW: "ATTENDANCE_DEVICE_VIEW",
  ATTENDANCE_DEVICE_SETUP: "ATTENDANCE_DEVICE_SETUP",
  ATTENDANCE_HISTORY_VIEW: "ATTENDANCE_HISTORY_VIEW",
  ATTENDANCE_TIMESHEET_VIEW: "ATTENDANCE_TIMESHEET_VIEW",
  PAYROLL_POLICY_VIEW: "PAYROLL_POLICY_VIEW",
  PAYROLL_POLICY_SETUP: "PAYROLL_POLICY_SETUP",
  PAYROLL_VIEW: "PAYROLL_VIEW",
  PAYROLL_MANAGE: "PAYROLL_MANAGE",
  PAYROLL_APPROVE: "PAYROLL_APPROVE",
  PAYROLL_PAY: "PAYROLL_PAY",
  PAYROLL_VIEW_SELF: "PAYROLL_VIEW_SELF",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DEFINITIONS: Array<{
  key: PermissionKey;
  name: string;
  description: string;
}> = [
  {
    key: PERMISSIONS.POSITION_SETUP,
    name: "Setup Position",
    description: "Create a position and attach permissions.",
  },
  {
    key: PERMISSIONS.POSITION_VIEW,
    name: "View Position",
    description: "View position details.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_MANAGE_JOB,
    name: "Manage Recruitment Job",
    description: "Manage recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_VIEW_APPLICATION,
    name: "View Recruitment Application",
    description: "View recruitment applications and candidate details.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION,
    name: "Manage Recruitment Application",
    description: "Approve or reject recruitment applications.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_APPROVE_DIRECT,
    name: "Approve Recruitment Directly",
    description: "Approve a candidate without interview.",
  },
  {
    key: PERMISSIONS.DEPARTMENT_VIEW,
    name: "View Department",
    description: "View department details.",
  },
  {
    key: PERMISSIONS.DEPARTMENT_SETUP,
    name: "Setup Department",
    description: "Create and manage departments.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_VIEW_LIST,
    name: "View Employee List",
    description: "View employee list.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_VIEW_DETAIL,
    name: "View Employee Detail",
    description: "View employee detail.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_CREATE,
    name: "Create Employee",
    description: "Create employee profile.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_UPDATE_BASIC,
    name: "Update Employee Basic",
    description: "Update employee basic information.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_UPDATE_JOB,
    name: "Update Employee Job",
    description: "Update employee job information.",
  },
  {
    key: PERMISSIONS.EMPLOYEE_UPDATE_SELF_BASIC,
    name: "Update Self Basic",
    description: "Update own basic information.",
  },
  {
    key: PERMISSIONS.WORK_SCHEDULE_MANAGE,
    name: "Manage Work Schedule",
    description:
      "Create, update, and delete work shifts and schedule assignments.",
  },
  {
    key: PERMISSIONS.WORK_SCHEDULE_REGISTER,
    name: "Register Work Schedule",
    description: "Register work schedule changes for approval.",
  },
  {
    key: PERMISSIONS.WORK_SCHEDULE_VIEW,
    name: "View Work Schedule",
    description: "View work shifts and schedule assignments.",
  },
  {
    key: PERMISSIONS.ATTENDANCE_DEVICE_VIEW,
    name: "View Attendance Device",
    description: "View attendance devices and their logs.",
  },
  {
    key: PERMISSIONS.ATTENDANCE_DEVICE_SETUP,
    name: "Setup Attendance Device",
    description: "Create and manage attendance devices.",
  },
  {
    key: PERMISSIONS.ATTENDANCE_HISTORY_VIEW,
    name: "View Attendance History",
    description: "View employee attendance history.",
  },
  {
    key: PERMISSIONS.ATTENDANCE_TIMESHEET_VIEW,
    name: "View Attendance Timesheet",
    description: "View employee monthly attendance timesheet.",
  },
  {
    key: PERMISSIONS.PAYROLL_POLICY_VIEW,
    name: "View Payroll Policy",
    description: "View salary insurance, tax, and attendance bonus policies.",
  },
  {
    key: PERMISSIONS.PAYROLL_POLICY_SETUP,
    name: "Setup Payroll Policy",
    description: "Create, update, delete, and assign salary policies.",
  },
  {
    key: PERMISSIONS.PAYROLL_VIEW,
    name: "View Payroll",
    description: "View employee payrolls.",
  },
  {
    key: PERMISSIONS.PAYROLL_MANAGE,
    name: "Manage Payroll",
    description: "Create payrolls and request payroll approval.",
  },
  {
    key: PERMISSIONS.PAYROLL_APPROVE,
    name: "Approve Payroll",
    description: "Approve payrolls before employees can view them.",
  },
  {
    key: PERMISSIONS.PAYROLL_PAY,
    name: "Pay Payroll",
    description: "Mark payrolls as paid.",
  },
  {
    key: PERMISSIONS.PAYROLL_VIEW_SELF,
    name: "View Own Payroll",
    description: "View approved or paid payrolls for the current employee.",
  },
];
