import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../../features/auth/pages/ForgotPasswordPage";
import { ChangePasswordPage } from "../../features/auth/pages/ChangePasswordPage";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { VerifyOtpPage } from "../../features/auth/pages/VerifyOtpPage";
import { AttendanceManagementPage } from "../../features/attendance/pages/AttendanceManagementPage";
import { CategoryPlaceholderPage } from "../../features/categories/pages/CategoryPlaceholderPage";
import { DepartmentListPage } from "../../features/departments/pages/DepartmentListPage";
import { EmployeeDetailPage } from "../../features/employees/pages/EmployeeDetailPage";
import { EmployeeListPage } from "../../features/employees/pages/EmployeeListPage";
import { HomePage } from "../../features/home/pages/HomePage";
import { PayrollEmployeeDetailPage } from "../../features/payroll/pages/PayrollEmployeeDetailPage";
import { PayrollBonusPenaltyPage } from "../../features/payroll/pages/PayrollBonusPenaltyPage";
import { PayrollPage } from "../../features/payroll/pages/PayrollPage";
import { PayrollPeriodListPage } from "../../features/payroll/pages/PayrollPeriodListPage";
import { PayrollPeriodOverviewPage } from "../../features/payroll/pages/PayrollPeriodOverviewPage";
import { PayrollPolicyPage } from "../../features/payroll-policies/pages/PayrollPolicyPage";
import { PositionListPage } from "../../features/positions/pages/PositionListPage";
import { ProfilePage } from "../../features/profile/pages/ProfilePage";
import { RecruitmentApplicationListPage } from "../../features/recruitment/pages/RecruitmentApplicationListPage";
import { RecruitmentJobListPage } from "../../features/recruitment/pages/RecruitmentJobListPage";
import { RequestCreatePage } from "../../features/requests/pages/RequestCreatePage";
import { RequestEmployeePage } from "../../features/requests/pages/RequestEmployeePage";
import { RequestMinePage } from "../../features/requests/pages/RequestMinePage";
import { RequestAllPage } from "../../features/requests/pages/RequestAllPage";
import { ScheduleAssignPage } from "../../features/schedules/pages/ScheduleAssignPage";
import { ScheduleRegisterPage } from "../../features/schedules/pages/ScheduleRegisterPage";
import { ScheduleWeeklyPage } from "../../features/schedules/pages/ScheduleWeeklyPage";
import { WorkShiftListPage } from "../../features/work-shifts/pages/WorkShiftListPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { paths } from "./paths";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={paths.home} replace />} />
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path={paths.verifyOtp} element={<VerifyOtpPage />} />
      <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={paths.resetPassword} element={<ResetPasswordPage />} />
      <Route
        path={paths.home}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.changePassword}
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.employees}
        element={
          <ProtectedRoute>
            <EmployeeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.employeeDetail}
        element={
          <ProtectedRoute>
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.departments}
        element={
          <ProtectedRoute>
            <DepartmentListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.positions}
        element={
          <ProtectedRoute>
            <PositionListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.recruitmentJobs}
        element={
          <ProtectedRoute>
            <RecruitmentJobListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.recruitmentApplications}
        element={
          <ProtectedRoute>
            <RecruitmentApplicationListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.candidateApplications}
        element={
          <ProtectedRoute>
            <RecruitmentApplicationListPage mine />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.scheduleMine}
        element={
          <ProtectedRoute>
            <ScheduleWeeklyPage scope="self" />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.scheduleWeekly}
        element={
          <ProtectedRoute>
            <ScheduleWeeklyPage scope="employees" />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.scheduleAssign}
        element={
          <ProtectedRoute>
            <ScheduleAssignPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.scheduleRegister}
        element={
          <ProtectedRoute>
            <ScheduleRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.requestsCreate}
        element={
          <ProtectedRoute>
            <RequestCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.requestsMine}
        element={
          <ProtectedRoute>
            <RequestMinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.requestsEmployee}
        element={
          <ProtectedRoute>
            <RequestEmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.requestsWatching}
        element={<Navigate to={paths.requestsEmployee} replace />}
      />
      <Route
        path={paths.requestsPending}
        element={<Navigate to={paths.requestsEmployee} replace />}
      />
      <Route
        path={paths.requestsAll}
        element={
          <ProtectedRoute>
            <RequestAllPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceDevices}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage
              initialTab="devices"
              tabs={["devices", "fingerprints"]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceHistory}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage initialTab="myLogs" tabs={["myLogs"]} />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceTimesheet}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage
              initialTab="myTimesheet"
              tabs={["myTimesheet"]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceEmployeeHistory}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage
              initialTab="employeeLogs"
              tabs={["employeeLogs"]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceEmployeeTimesheet}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage
              initialTab="employeeTimesheet"
              tabs={["employeeTimesheet"]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.attendanceStandardWorkDays}
        element={
          <ProtectedRoute>
            <AttendanceManagementPage
              initialTab="standardWorkDays"
              tabs={["standardWorkDays"]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollManagement}
        element={
          <ProtectedRoute>
            <PayrollPeriodListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollPeriodOverviewRoute}
        element={
          <ProtectedRoute>
            <PayrollPeriodOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollEmployeeDetailRoute}
        element={
          <ProtectedRoute>
            <PayrollEmployeeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollMine}
        element={
          <ProtectedRoute>
            <PayrollPage mode="mine" />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollBonusPenaltiesMine}
        element={
          <ProtectedRoute>
            <PayrollBonusPenaltyPage scope="mine" />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollBonusPenalties}
        element={
          <ProtectedRoute>
            <PayrollBonusPenaltyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.payrollBonusPenaltiesLegacy}
        element={<Navigate to={paths.payrollBonusPenalties} replace />}
      />
      <Route
        path={paths.payrollPolicies}
        element={
          <ProtectedRoute>
            <PayrollPolicyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.branches}
        element={
          <ProtectedRoute>
            <CategoryPlaceholderPage title="Danh sách chi nhánh" />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.workShifts}
        element={
          <ProtectedRoute>
            <WorkShiftListPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  );
}
