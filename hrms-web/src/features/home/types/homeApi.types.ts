export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CANDIDATE' | string

export type HomeProfile = {
  id?: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  avatar?: string
  position?: { id?: string; name?: string } | null
  department?: { id?: string; name?: string } | null
}

export type RecruitmentJob = {
  id: string
  title?: string
  status?: string
  deadline?: string | null
  applied?: boolean
  position?: { name?: string } | null
  department?: { name?: string } | null
}

export type JobApplication = {
  id: string
  status?: string
  appliedAt?: string
  candidate?: HomeProfile | null
  job?: RecruitmentJob | null
  recruitmentJob?: RecruitmentJob | null
  position?: { name?: string } | null
  department?: { name?: string } | null
}

export type WorkSchedule = {
  id: string
  date?: string
  shiftLinks?: Array<{
    workShift?: {
      name?: string
      startTime?: string
      endTime?: string
    }
  }>
  shifts?: Array<{
    name?: string
    startTime?: string
    endTime?: string
  }>
}

export type ApprovalRequest = {
  id: string
  title?: string
  type?: string
  status?: string
  createdAt?: string
  requester?: HomeProfile | null
}

export type HomeData = {
  role: UserRole
  profile: HomeProfile | null
  permissions: string[]
  jobs: RecruitmentJob[]
  applications: JobApplication[]
  schedules: WorkSchedule[]
  pendingApprovals: ApprovalRequest[]
}
