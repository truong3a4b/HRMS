import {
  AppWindow,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileCheck2,
  FileText,
  Grid3X3,
  Lock,
  LogOut,
  Mail,
  Settings,
  User,
  Users,
} from 'lucide-react'
import type {
  AccountAction,
  DrawerItem,
  NotificationItem,
  StatItem,
} from '../types/home.types'

const drawerIconClass = 'h-5 w-5'

export function getDrawerItems(): DrawerItem[] {
  return [
    { key: 'overview', label: 'Tổng quan', icon: <CalendarDays className={drawerIconClass} /> },
    { key: 'approval', label: 'Yêu cầu chờ duyệt', icon: <ClipboardList className={drawerIconClass} />, badge: 1 },
    { key: 'employees', label: 'Nhân viên', icon: <Users className={drawerIconClass} />, expandable: true },
    { key: 'contracts', label: 'Hợp đồng', icon: <FileCheck2 className={drawerIconClass} />, expandable: true },
    { key: 'schedules', label: 'Lịch làm việc', icon: <CalendarDays className={drawerIconClass} />, expandable: true },
    { key: 'attendance', label: 'Chấm công', icon: <CheckSquare className={drawerIconClass} />, expandable: true },
    { key: 'tasks', label: 'Giao việc', icon: <BriefcaseBusiness className={drawerIconClass} />, expandable: true },
    { key: 'internal-news', label: 'Truyền thông nội bộ', icon: <Bell className={drawerIconClass} />, expandable: true },
    { key: 'salary', label: 'Lương', icon: <FileText className={drawerIconClass} />, expandable: true },
    { key: 'reports', label: 'Báo cáo', icon: <BarChart3 className={drawerIconClass} />, expandable: true },
    { key: 'payroll-config', label: 'Cấu hình tính lương', icon: <AppWindow className={drawerIconClass} />, expandable: true },
    { key: 'categories', label: 'Danh mục', icon: <Grid3X3 className={drawerIconClass} />, expandable: true },
    { key: 'settings', label: 'Cài đặt', icon: <Settings className={drawerIconClass} /> },
  ]
}

export function getTodayStats(): StatItem[] {
  return [
    { key: 'late', value: '0', label: 'Đi muộn' },
    { key: 'early', value: '0', label: 'Về sớm' },
    { key: 'missing-in', value: '0', label: 'Quên check-in' },
    { key: 'missing-out', value: '0', label: 'Quên check-out' },
    { key: 'leave', value: '0', label: 'Nghỉ phép', wide: true },
    { key: 'absent', value: '0', label: 'Nghỉ không phép', wide: true },
    { key: 'extra', value: '0', label: 'Ca phát sinh so với kế hoạch', wide: true },
  ]
}

export function getNotifications(): NotificationItem[] {
  return [
    {
      key: 'welcome',
      title: 'Thông báo',
      message: 'Chưa có thông báo mới cần xử lý.',
      time: 'Hôm nay',
    },
  ]
}

export function getAccountActions(onLogout: () => void): AccountAction[] {
  return [
    {
      key: 'profile',
      title: 'Thông tin cá nhân',
      subtitle: 'Chỉnh sửa thông tin cá nhân',
      icon: <User className="h-5 w-5" />,
    },
    {
      key: 'security',
      title: 'Bảo mật',
      subtitle: 'Danh sách thiết bị đăng nhập, đổi mật khẩu',
      icon: <Lock className="h-5 w-5" />,
    },
    {
      key: 'feedback',
      title: 'Đóng góp ý kiến, báo lỗi',
      subtitle: 'Gửi góp ý để cải thiện hệ thống',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      key: 'logout',
      title: 'Đăng xuất',
      icon: <LogOut className="h-5 w-5" />,
      danger: true,
      onClick: onLogout,
    },
  ]
}
