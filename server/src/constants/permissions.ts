export const PERMISSIONS = {
  POSITION_CREATE: "POSITION_CREATE",
  POSITION_DELETE: "POSITION_DELETE",
  POSITION_VIEW_LIST: "POSITION_VIEW_LIST",
  RECRUITMENT_VIEW_JOB: "RECRUITMENT_VIEW_JOB",
  RECRUITMENT_MANAGE_JOB: "RECRUITMENT_MANAGE_JOB",
  RECRUITMENT_CREATE_JOB: "RECRUITMENT_CREATE_JOB",
  RECRUITMENT_UPDATE_JOB: "RECRUITMENT_UPDATE_JOB",
  RECRUITMENT_CLOSE_JOB: "RECRUITMENT_CLOSE_JOB",
  RECRUITMENT_VIEW_PIPELINE: "RECRUITMENT_VIEW_PIPELINE",
  RECRUITMENT_VIEW_APPLICATION: "RECRUITMENT_VIEW_APPLICATION",
  RECRUITMENT_MANAGE_APPLICATION: "RECRUITMENT_MANAGE_APPLICATION",
  RECRUITMENT_SCHEDULE_INTERVIEW: "RECRUITMENT_SCHEDULE_INTERVIEW",
  RECRUITMENT_SUBMIT_EVALUATION: "RECRUITMENT_SUBMIT_EVALUATION",
  RECRUITMENT_APPROVE_DIRECT: "RECRUITMENT_APPROVE_DIRECT",
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
    key: PERMISSIONS.POSITION_DELETE,
    name: "Delete Position",
    description: "Delete a position if no employees are assigned to it.",
  },
  {
    key: PERMISSIONS.POSITION_VIEW_LIST,
    name: "View Position List",
    description: "View list of positions.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_VIEW_JOB,
    name: "View Recruitment Job",
    description: "View recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_MANAGE_JOB,
    name: "Manage Recruitment Job",
    description: "Manage recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_CREATE_JOB,
    name: "Create Recruitment Job",
    description: "Create recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_UPDATE_JOB,
    name: "Update Recruitment Job",
    description: "Update recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_CLOSE_JOB,
    name: "Close Recruitment Job",
    description: "Close recruitment job postings.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_VIEW_PIPELINE,
    name: "View Recruitment Pipeline",
    description: "View overall recruitment pipeline statistics.",
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
    key: PERMISSIONS.RECRUITMENT_SCHEDULE_INTERVIEW,
    name: "Schedule Interview",
    description: "Create and manage interview schedules.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_SUBMIT_EVALUATION,
    name: "Submit Interview Evaluation",
    description: "Submit interview feedback and evaluation.",
  },
  {
    key: PERMISSIONS.RECRUITMENT_APPROVE_DIRECT,
    name: "Approve Recruitment Directly",
    description: "Approve a candidate without interview.",
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
