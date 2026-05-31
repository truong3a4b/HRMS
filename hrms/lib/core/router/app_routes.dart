abstract class AppRoutes {
  // Auth routes
  static const splash = '/splash';
  static const login = '/login';
  static const register = '/register';
  static const verifyOtp = '/verify-otp';

  // Shell (bottom nav) routes
  static const home = '/home';
  static const task = '/task';
  static const notification = '/notification';
  static const account = '/account';

  // Employee routes
  static const employeeList = '/employee-list';
  static const addEmployee = '/add-employee';

  // Department routes
  static const departmentList = '/department-list';
  static const addDepartment = '/add-department';

  // Dynamic employee routes
  static String employeeDetail(String id) => '/employee-detail/$id';
  static String editEmployeeBasicInfo(String id) =>
      '/edit-employee-basic-info/$id';
  static String editEmployeeJob(String id) => '/edit-employee-job/$id';

  // Dynamic department routes
  static String departmentDetail(String id) => '/department-detail/$id';
  static String editDepartmentBasicInfo(String id) =>
      '/edit-department-basic-info/$id';

  //position routes
  static const positionList = '/position-list';
  static const addPosition = '/add-position';
  static String updatePosition(String id) => '/update-position/$id';

  // Work shift routes
  static const workShiftList = '/work-shift-list';
  static String workShiftDetail(String id) => '/work-shift-detail/$id';

  // Attendance routes
  static const myAttendanceHistory = '/my-attendance-history';
  static const myAttendanceTimesheet = '/my-attendance-timesheet';

  // Schedule routes
  static const mySchedule = '/my-schedule';

  // Request routes
  static const myRequests = '/my-requests';
  static const employeeRequests = '/employee-requests';
  static const createLeaveRequest = '/request-create-leave';
  static const createAttendanceCorrectionRequest =
      '/request-create-attendance-correction';

  // Payroll routes
  static const holidayList = '/holiday-list';
  static const myPayroll = '/my-payroll';
  static const myBonusPenalties = '/my-bonus-penalties';
}
