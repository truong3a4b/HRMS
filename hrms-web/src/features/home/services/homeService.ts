import { apiClient } from '../../../services/http/apiClient'
import type { ApiResponse, AuthUser } from '../../auth/types/auth.types'
import type {
  ApprovalRequest,
  HomeData,
  HomeProfile,
  JobApplication,
  RecruitmentJob,
  WorkSchedule,
} from '../types/homeApi.types'

type Paginated<T> = {
  items?: T[]
}

const currentMonth = () => new Date().toISOString().slice(0, 7)

const normalizeRole = (role?: string) => (role ?? '').toUpperCase()

const canApproveRequests = (role: string, permissions: string[]) =>
  role === 'ADMIN' ||
  permissions.some((permission) =>
    [
      'RECRUITMENT_MANAGE_APPLICATION',
      'RECRUITMENT_APPROVE_DIRECT',
      'WORK_SCHEDULE_MANAGE',
    ].includes(permission),
  )

const getItems = <T>(value: Paginated<T> | T[] | undefined): T[] => {
  if (Array.isArray(value)) {
    return value
  }

  return value?.items ?? []
}

async function loadPermissions(role: string) {
  if (role === 'CANDIDATE') {
    return []
  }

  const response = await apiClient.get<
    ApiResponse<{ permissions?: string[] }>
  >('/auth/my-permissions')

  return response.data.data.permissions ?? []
}

async function loadProfile(role: string) {
  const endpoint = role === 'CANDIDATE' ? '/candidates/profile' : '/employees/me'
  const response = await apiClient.get<ApiResponse<HomeProfile>>(endpoint)
  return response.data.data
}

async function loadCandidateJobs() {
  const response = await apiClient.get<ApiResponse<Paginated<RecruitmentJob>>>(
    '/recruitment/jobs',
    { params: { page: 1, limit: 6 } },
  )

  return getItems(response.data.data)
}

async function loadCandidateApplications() {
  const response = await apiClient.get<ApiResponse<Paginated<JobApplication>>>(
    '/candidates/applications/me',
  )

  return getItems(response.data.data)
}

async function loadEmployeeSchedules(employeeId?: string) {
  if (!employeeId) {
    return []
  }

  const response = await apiClient.get<ApiResponse<WorkSchedule[]>>(
    `/schedule-assignments/employee/${employeeId}`,
    { params: { month: currentMonth() } },
  )

  return response.data.data ?? []
}

async function loadPendingApprovals() {
  const response = await apiClient.get<ApiResponse<Paginated<ApprovalRequest>>>(
    '/requests/me/pending-approvals',
    { params: { page: 1, limit: 6, status: 'PENDING' } },
  )

  return getItems(response.data.data)
}

async function settle<T>(promise: Promise<T>, fallback: T) {
  const result = await Promise.allSettled([promise])
  const first = result[0]

  return first.status === 'fulfilled' ? first.value : fallback
}

export const homeService = {
  async loadHome(user: AuthUser): Promise<HomeData> {
    const role = normalizeRole(user.role)

    if (role === 'ADMIN') {
      const [profile, permissions, pendingApprovals] = await Promise.all([
        settle(loadProfile(role), null as HomeProfile | null),
        loadPermissions(role),
        settle(loadPendingApprovals(), [] as ApprovalRequest[]),
      ])

      return {
        role,
        profile,
        permissions,
        jobs: [],
        applications: [],
        schedules: [],
        pendingApprovals,
      }
    }

    const [profile, permissions] = await Promise.all([
      loadProfile(role),
      loadPermissions(role),
    ])

    if (role === 'CANDIDATE') {
      const [jobs, applications] = await Promise.all([
        settle(loadCandidateJobs(), [] as RecruitmentJob[]),
        settle(loadCandidateApplications(), [] as JobApplication[]),
      ])

      return {
        role,
        profile,
        permissions,
        jobs,
        applications,
        schedules: [],
        pendingApprovals: [],
      }
    }

    const employeeId = user.employeeId ?? profile?.id
    const shouldLoadPendingApprovals = canApproveRequests(role, permissions)
    const [schedules, pendingApprovals] = await Promise.all([
      settle(loadEmployeeSchedules(employeeId), [] as WorkSchedule[]),
      shouldLoadPendingApprovals
        ? settle(loadPendingApprovals(), [] as ApprovalRequest[])
        : Promise.resolve([] as ApprovalRequest[]),
    ])

    return {
      role,
      profile,
      permissions,
      jobs: [],
      applications: [],
      schedules,
      pendingApprovals,
    }
  },
}
