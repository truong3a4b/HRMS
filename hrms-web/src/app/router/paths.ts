export const paths = {
  // Auth
  login: '/login',
  register: '/register',
  verifyOtp: '/verify-otp',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  changePassword: '/profile/security',

  // Home
  home: '/home',

  // Recruitment
  recruitmentApplications: '/recruitment/applications',
  recruitmentJobs: '/recruitment/jobs',
  candidateApplications: '/candidate/applications',

  // Employees
  employees: '/employees',
  employeeDetail: '/employees/:id',
  employeeDetailById: (id: string) => `/employees/${id}`,

  // Categories
  departments: '/categories/departments',
  positions: '/categories/positions',
  branches: '/categories/branches',
  workShifts: '/categories/work-shifts',
  holidays: '/categories/holidays',

  // Attendance
  attendanceDevices: '/attendance/devices',
  attendanceCheckin: '/attendance/checkin',
  attendanceHistory: '/attendance/history',
  attendanceTimesheet: '/attendance/timesheet',
  attendanceEmployeeHistory: '/attendance/employees/history',
  attendanceEmployeeTimesheet: '/attendance/employees/timesheet',
  attendanceStandardWorkDays: '/attendance/standard-work-days',
  attendanceOvertime: '/attendance/overtime-request',

  // Work Schedule
  scheduleMine: '/schedule/me',
  scheduleWeekly: '/schedule/weekly',
  scheduleAssign: '/schedule/assign',
  scheduleRegister: '/schedule/register',
  scheduleLeaveRequest: '/schedule/leave-request',

  // Requests
  requestsCreate: '/requests/create',
  requestsMine: '/requests/mine',
  requestsEmployee: '/requests/employee',
  requestsWatching: '/requests/watching',
  requestsPending: '/requests/pending',
  requestsAll: '/requests/all',

  // Salary
  salaryCurrent: '/salary/current',
  salaryAdvance: '/salary/advance',
  salaryAddition: '/salary/addition',
  salaryDeduction: '/salary/deduction',
  salarySlips: '/salary/slips',
  salaryHistory: '/salary/history',
  payrollManagement: '/salary/payrolls',
  payrollPayments: '/salary/payments',
  payrollPeriodOverview: (periodId: string) => `/salary/payrolls/${periodId}`,
  payrollEmployeeDetail: (periodId: string, employeeId: string) =>
    `/salary/payrolls/${periodId}/employees/${employeeId}`,
  payrollPeriodOverviewRoute: '/salary/payrolls/:periodId',
  payrollEmployeeDetailRoute: '/salary/payrolls/:periodId/employees/:employeeId',
  payrollMine: '/salary/mine',
  payrollBonusPenaltiesMine: '/salary/bonus-penalties/mine',
  payrollBonusPenalties: '/salary/bonus-penalties',
  payrollBonusPenaltiesLegacy: '/salary/addition',
  payrollPolicies: '/salary/policies',

  // Profile
  profile: '/profile',
  security: '/profile/security',
  feedback: '/feedback',
} as const
