import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { VerifyOtpPage } from "../../features/auth/pages/VerifyOtpPage";
import { CategoryPlaceholderPage } from "../../features/categories/pages/CategoryPlaceholderPage";
import { DepartmentListPage } from "../../features/departments/pages/DepartmentListPage";
import { EmployeeDetailPage } from "../../features/employees/pages/EmployeeDetailPage";
import { EmployeeListPage } from "../../features/employees/pages/EmployeeListPage";
import { HomePage } from "../../features/home/pages/HomePage";
import { PositionListPage } from "../../features/positions/pages/PositionListPage";
import { RecruitmentApplicationListPage } from "../../features/recruitment/pages/RecruitmentApplicationListPage";
import { RecruitmentJobListPage } from "../../features/recruitment/pages/RecruitmentJobListPage";
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
      <Route
        path={paths.home}
        element={
          <ProtectedRoute>
            <HomePage />
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
