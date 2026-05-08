export interface HomeState {
  me: Employee | Candidate | null
  role: UserRole
  pendingCount?: number
  todayStats?: TodayStat[]
  jobs?: RecruitmentJob[]
  applications?: JobApplication[]
}

export interface Employee {
  id: string
  name: string
  email: string
  avatarUrl?: string
  position?: Position
  department?: Department
}

export interface Position {
  id: string
  name: string
}

export interface Department {
  id: string
  name: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface RecruitmentJob {
  id: string
  title: string
  department: string
  location: string
  salaryRange: string
  status: 'active' | 'closed' | 'draft'
  applicationCount: number
  deadline: string
}

export interface JobApplication {
  id: string
  jobTitle: string
  company: string
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  appliedDate: string
  jobId: string
}

export interface TodayStat {
  label: string
  value: string | number
  color: string
  icon: string
}

export const UserRole = {
  employee: 'employee' as const,
  admin: 'admin' as const,
  candidate: 'candidate' as const,
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]
