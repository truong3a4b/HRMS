import {
  AppWindow,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  Grid3X3,
  Lock,
  LogOut,
  Mail,
  Settings,
  User,
  Users,
} from "lucide-react";
import type {
  AccountAction,
  DrawerItem,
  NotificationItem,
  StatItem,
} from "../types/home.types";
import { paths } from "../../../app/router/paths";

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

  return [
    {
      key: "overview",
      label: "Tổng quan",
      icon: <CalendarDays className={drawerIconClass} />,
      path: paths.home,
    },
    {
      key: "approval",
      label: "Yêu cầu chờ duyệt",
      icon: <ClipboardList className={drawerIconClass} />,
      badge: 1,
    },
    {
      key: "recruitment",
      label: "Tuyển dụng",
      icon: <BriefcaseBusiness className={drawerIconClass} />,
      expandable: true,
      children: [
        {
          key: "recruitment-jobs",
          label: "Vị trí tuyển dụng",
          path: paths.recruitmentJobs,
        },
        {
          key: "recruitment-applications",
          label: "Danh sách ứng tuyển",
          path: paths.recruitmentApplications,
        },
        ...(isCandidate
          ? [
              {
                key: "candidate-applications",
                label: "Đơn ứng tuyển của tôi",
                path: paths.candidateApplications,
              },
            ]
          : []),
      ],
    },
    {
      key: "employees",
      label: "Nhân viên",
      icon: <Users className={drawerIconClass} />,
      path: paths.employees,
    },
    ...(scheduleChildren.length
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
    {
      key: "attendance",
      label: "Chấm công",
      icon: <CheckSquare className={drawerIconClass} />,
      expandable: true,
    },
    {
      key: "salary",
      label: "Lương",
      icon: <FileText className={drawerIconClass} />,
      expandable: true,
    },
    {
      key: "payroll-config",
      label: "Cấu hình tính lương",
      icon: <AppWindow className={drawerIconClass} />,
      expandable: true,
    },
    {
      key: "categories",
      label: "Danh mục",
      icon: <Grid3X3 className={drawerIconClass} />,
      expandable: true,
      children: [
        {
          key: "departments",
          label: "Bộ phận",
          path: paths.departments,
        },
        {
          key: "positions",
          label: "Chức vụ",
          path: paths.positions,
        },

        {
          key: "work-shifts",
          label: "Ca làm việc",
          path: paths.workShifts,
        },
      ],
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <Settings className={drawerIconClass} />,
    },
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
      key: "profile",
      title: "Thông tin cá nhân",
      subtitle: "Chỉnh sửa thông tin cá nhân",
      icon: <User className="h-5 w-5" />,
    },
    {
      key: "security",
      title: "Bảo mật",
      subtitle: "Danh sách thiết bị đăng nhập, đổi mật khẩu",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      key: "feedback",
      title: "Đóng góp ý kiến, báo lỗi",
      subtitle: "Gửi góp ý để cải thiện hệ thống",
      icon: <Mail className="h-5 w-5" />,
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
