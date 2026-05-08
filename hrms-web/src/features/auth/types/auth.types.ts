export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type AuthUser = {
  id: string
  email: string
  role?: string
  employeeId?: string
  permissions?: string[]
}

export type LoginResponseData = {
  accessToken: string
  user: AuthUser
}

export type RegisterResponseData = {
  email: string
  expiresAt: string
}

export type CurrentUserResponseData = {
  user: AuthUser
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}
