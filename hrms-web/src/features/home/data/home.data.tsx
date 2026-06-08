import {
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Grid3X3,
  LayoutDashboard,
  Lock,
  LogOut,
  Users,
  WalletCards,
  Calculator,
} from "lucide-react";
import { paths } from "../../../app/router/paths";
import type {
  AccountAction,
  DrawerItem,
  NotificationItem,
  StatItem,
} from "../types/home.types";

const drawerIconClass = "h-5 w-5";

export function getDrawerItems(
  userRole?: string,
  permissions: string[] = [],
): DrawerItem[] {
  const isCandidate = userRole?.toUpperCase() === "CANDIDATE";
  const isAdmin = userRole?.toUpperCase() === "ADMIN";
  const permissionSet = new Set(permissions);
  const hasPermission = (permission: string) =>
    isAdmin || permissionSet.has(permission);

  const scheduleChildren = [
    ...(!isCandidate
      ? [
          {
            key: "schedule-mine",
            label: "Lịch của tôi",
            path: paths.scheduleMine,
          },
        ]
      : []),
    ...(hasPermission("WORK_SCHEDULE_VIEW")
      ? [
          {
            key: "schedule-weekly",
            label: "Lịch nhân viên",
            path: paths.scheduleWeekly,
          },
        ]
      : []),
    ...(hasPermission("WORK_SCHEDULE_MANAGE")
      ? [
          {
            key: "schedule-assign",
            label: "Áp lịch",
            path: paths.scheduleAssign,
          },
        ]
      : []),
    ...(hasPermission("WORK_SCHEDULE_REGISTER")
      ? [
          {
            key: "schedule-register",
            label: "Đăng ký lịch",
            path: paths.scheduleRegister,
          },
        ]
      : []),
  ];

  const requestChildren = [
    {
      key: "requests-create",
      label: "Tạo yêu cầu",
      path: paths.requestsCreate,
    },
    {
      key: "requests-mine",
      label: "Yêu cầu của tôi",
      path: paths.requestsMine,
    },
    {
      key: "requests-employee",
      label: "Yêu cầu của nhân viên",
      path: paths.requestsEmployee,
    },
    ...(isAdmin
      ? [
          {
            key: "requests-all",
            label: "Tất cả yêu cầu",
            path: paths.requestsAll,
          },
        ]
      : []),
  ];

  const recruitmentChildren = [
    {
      key: "recruitment-jobs",
      label: "Vị trí tuyển dụng",
      path: paths.recruitmentJobs,
    },
    ...(hasPermission("RECRUITMENT_VIEW_APPLICATION")
      ? [
          {
            key: "recruitment-applications",
            label: "Danh sách ứng tuyển",
            path: paths.recruitmentApplications,
          },
        ]
      : []),
    ...(isCandidate
      ? [
          {
            key: "candidate-applications",
            label: "Đơn ứng tuyển của tôi",
            path: paths.candidateApplications,
          },
        ]
      : []),
  ];

  const attendanceChildren = [
    ...(hasPermission("ATTENDANCE_DEVICE_VIEW")
      ? [
          {
            key: "attendance-devices",
            label: "Thiết bị & vân tay",
            path: paths.attendanceDevices,
          },
        ]
      : []),
    ...(!isCandidate
      ? [
          {
            key: "attendance-history",
            label: "Lịch sử chấm công",
            path: paths.attendanceHistory,
          },
          {
            key: "attendance-timesheet",
            label: "Bảng công của tôi",
            path: paths.attendanceTimesheet,
          },
        ]
      : []),
    ...(hasPermission("ATTENDANCE_HISTORY_VIEW")
      ? [
          {
            key: "attendance-employee-history",
            label: "Lịch sử nhân viên",
            path: paths.attendanceEmployeeHistory,
          },
        ]
      : []),
    ...(hasPermission("ATTENDANCE_TIMESHEET_VIEW")
      ? [
          {
            key: "attendance-employee-timesheet",
            label: "Bảng công nhân viên",
            path: paths.attendanceEmployeeTimesheet,
          },
        ]
      : []),
    ...(hasPermission("PAYROLL_POLICY_SETUP") ||
    hasPermission("WORK_SCHEDULE_MANAGE")
      ? [
          {
            key: "attendance-standard-work-days",
            label: "Công chuẩn",
            path: paths.attendanceStandardWorkDays,
          },
        ]
      : []),
  ];

  const payrollChildren = [
    ...(!isCandidate
      ? [
          {
            key: "payroll-mine",
            label: "Bảng lương của tôi",
            path: paths.payrollMine,
          },
          {
            key: "payroll-bonus-penalties-mine",
            label: "Phiếu thưởng/phạt của tôi",
            path: paths.payrollBonusPenaltiesMine,
          },
        ]
      : []),
    ...(hasPermission("PAYROLL_VIEW") ||
    hasPermission("PAYROLL_MANAGE") ||
    hasPermission("PAYROLL_APPROVE") ||
    hasPermission("PAYROLL_PAY")
      ? [
          {
            key: "payroll-management",
            label: "Bảng lương",
            path: paths.payrollManagement,
          },
          {
            key: "payroll-payments",
            label: "Đợt trả lương",
            path: paths.payrollPayments,
          },
          {
            key: "payroll-bonus-penalties",
            label: "Phiếu thưởng/phạt",
            path: paths.payrollBonusPenalties,
          },
        ]
      : []),
  ];

  const categoryChildren = [
    ...(hasPermission("DEPARTMENT_VIEW")
      ? [
          {
            key: "departments",
            label: "Bộ phận",
            path: paths.departments,
          },
        ]
      : []),
    ...(hasPermission("POSITION_VIEW")
      ? [
          {
            key: "positions",
            label: "Chức vụ",
            path: paths.positions,
          },
        ]
      : []),
    ...(hasPermission("WORK_SCHEDULE_MANAGE") || isAdmin
      ? [
          {
            key: "work-shifts",
            label: "Ca làm việc",
            path: paths.workShifts,
          },
        ]
      : []),
    ...(hasPermission("PAYROLL_POLICY_VIEW") ||
    hasPermission("PAYROLL_POLICY_SETUP") ||
    isAdmin
      ? [
          {
            key: "holidays",
            label: "Ngày lễ",
            path: paths.holidays,
          },
        ]
      : []),
  ];

  return [
    {
      key: "overview",
      label: "Tổng quan",
      icon: <LayoutDashboard className={drawerIconClass} />,
      path: paths.home,
    },
    ...(!isCandidate
      ? [
          {
            key: "requests",
            label: "Yêu cầu",
            icon: <ClipboardList className={drawerIconClass} />,
            expandable: true,
            children: requestChildren,
          },
        ]
      : []),
    ...(recruitmentChildren.length > 0
      ? [
          {
            key: "recruitment",
            label: "Tuyển dụng",
            icon: <BriefcaseBusiness className={drawerIconClass} />,
            expandable: true,
            children: recruitmentChildren,
          },
        ]
      : []),
    ...(hasPermission("EMPLOYEE_VIEW_LIST") || isAdmin
      ? [
          {
            key: "employees",
            label: "Nhân viên",
            icon: <Users className={drawerIconClass} />,
            path: paths.employees,
          },
        ]
      : []),
    ...(scheduleChildren.length > 0
      ? [
          {
            key: "schedules",
            label: "Lịch làm việc",
            icon: <CalendarDays className={drawerIconClass} />,
            expandable: true,
            children: scheduleChildren,
          },
        ]
      : []),
    ...(attendanceChildren.length > 0
      ? [
          {
            key: "attendance",
            label: "Chấm công",
            icon: <CheckSquare className={drawerIconClass} />,
            expandable: true,
            children: attendanceChildren,
          },
        ]
      : []),
    ...(payrollChildren.length > 0
      ? [
          {
            key: "salary",
            label: "Lương",
            icon: <WalletCards className={drawerIconClass} />,
            expandable: true,
            children: payrollChildren,
          },
        ]
      : []),
    ...(hasPermission("PAYROLL_POLICY_VIEW")
      ? [
          {
            key: "payroll-policies",
            label: "Chính sách lương",
            icon: <Calculator className={drawerIconClass} />,
            path: paths.payrollPolicies,
          },
        ]
      : []),
    ...(categoryChildren.length > 0
      ? [
          {
            key: "categories",
            label: "Danh mục",
            icon: <Grid3X3 className={drawerIconClass} />,
            expandable: true,
            children: categoryChildren,
          },
        ]
      : []),
  ];
}

export function getTodayStats(): StatItem[] {
  return [
    { key: "late", value: "0", label: "Đi muộn" },
    { key: "early", value: "0", label: "Về sớm" },
    { key: "missing-in", value: "0", label: "Quên check-in" },
    { key: "missing-out", value: "0", label: "Quên check-out" },
    { key: "leave", value: "0", label: "Nghỉ phép", wide: true },
    { key: "absent", value: "0", label: "Nghỉ không phép", wide: true },
    {
      key: "extra",
      value: "0",
      label: "Ca phát sinh so với kế hoạch",
      wide: true,
    },
  ];
}

export function getNotifications(): NotificationItem[] {
  return [
    {
      key: "welcome",
      title: "Thông báo",
      message: "Chưa có thông báo mới cần xử lý.",
      time: "Hôm nay",
    },
  ];
}

export function getAccountActions(onLogout: () => void): AccountAction[] {
  return [
    {
      key: "security",
      title: "Đổi mật khẩu",
      subtitle: "Thay đổi mật khẩu tài khoản",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      key: "logout",
      title: "Đăng xuất",
      icon: <LogOut className="h-5 w-5" />,
      danger: true,
      onClick: onLogout,
    },
  ];
}
