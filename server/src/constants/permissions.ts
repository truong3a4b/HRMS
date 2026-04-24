export const PERMISSIONS = {
  POSITION_CREATE: "POSITION_CREATE",
  POSITION_VIEW_LIST: "POSITION_VIEW_LIST",
  DEPARTMENT_VIEW_LIST: "DEPARTMENT_VIEW_LIST",
  EMPLOYEE_VIEW_LIST: "EMPLOYEE_VIEW_LIST",
  EMPLOYEE_VIEW_DETAIL: "EMPLOYEE_VIEW_DETAIL",
  EMPLOYEE_CREATE: "EMPLOYEE_CREATE",
  EMPLOYEE_UPDATE_BASIC: "EMPLOYEE_UPDATE_BASIC",
  EMPLOYEE_UPDATE_ADDITIONAL: "EMPLOYEE_UPDATE_ADDITIONAL",
  EMPLOYEE_UPDATE_JOB: "EMPLOYEE_UPDATE_JOB",
  EMPLOYEE_UPDATE_SELF_BASIC: "EMPLOYEE_UPDATE_SELF_BASIC",
  EMPLOYEE_UPDATE_SELF_ADDITIONAL: "EMPLOYEE_UPDATE_SELF_ADDITIONAL",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DEFINITIONS: Array<{
  key: PermissionKey;
  name: string;
  description: string;
}> = [
  {
    key: PERMISSIONS.POSITION_CREATE,
    name: "Create Position",
    description: "Create a position and attach permissions.",
  },
  {
    key: PERMISSIONS.POSITION_VIEW_LIST,
    name: "View Position List",
    description: "View list of positions.",
  },
  {
    key: PERMISSIONS.DEPARTMENT_VIEW_LIST,
    name: "View Department List",
    description: "View list of departments.",
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
    key: PERMISSIONS.EMPLOYEE_UPDATE_ADDITIONAL,
    name: "Update Employee Additional",
    description: "Update employee additional information.",
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
    key: PERMISSIONS.EMPLOYEE_UPDATE_SELF_ADDITIONAL,
    name: "Update Self Additional",
    description: "Update own additional information.",
  },
];
