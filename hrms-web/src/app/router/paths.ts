export const paths = {
  // Auth
  login: '/login',
  register: '/register',
  verifyOtp: '/verify-otp',

  // Home
  home: '/home',

  // Recruitment
  recruitmentApplications: '/recruitment/applications',
  recruitmentJobs: '/recruitment/jobs',
  candidateApplications: '/candidate/applications',

  // Employees
  employees: '/employees',
  employeeDetail: '/employees/:id',

  // Categories
  departments: '/categories/departments',
  positions: '/categories/positions',
  branches: '/categories/branches',
  workShifts: '/categories/work-shifts',

  // Attendance
  attendanceCheckin: '/attendance/checkin',
  attendanceHistory: '/attendance/history',
  attendanceTimesheet: '/attendance/timesheet',
  attendanceOvertime: '/attendance/overtime-request',

  // Work Schedule
  scheduleMine: '/schedule/me',
  scheduleWeekly: '/schedule/weekly',
  scheduleAssign: '/schedule/assign',
  scheduleRegister: '/schedule/register',
  scheduleLeaveRequest: '/schedule/leave-request',

  // Salary
  salaryCurrent: '/salary/current',
  salaryAdvance: '/salary/advance',
  salaryAddition: '/salary/addition',
  salaryDeduction: '/salary/deduction',
  salarySlips: '/salary/slips',
  salaryHistory: '/salary/history',

  // Profile
  profile: '/profile',
  security: '/profile/security',
  feedback: '/feedback',
} as const
