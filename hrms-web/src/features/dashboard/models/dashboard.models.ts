// Mock data types for Dashboard
export interface WorkStats {
  totalShifts: number
  scheduledEmployees: number
  checkedInEmployees: number
}

export interface AttendanceStat {
  label: string
  value: number
  color: string
  icon: string
}

export interface SalaryStats {
  expectedTotal: number
  currentTotal: number
}

export interface DashboardFilter {
  companyValue: string
  date: Date | null
}

export type MenuKey = 'overview' | 'approvals' | 'employees' | 'contracts' | 'schedule' | 'attendance' | 'tasks' | 'communication' | 'salary' | 'reports' | 'salary-config' | 'categories' | 'settings'
