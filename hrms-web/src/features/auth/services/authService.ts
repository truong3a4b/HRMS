import { apiClient } from '../../../services/http/apiClient'
import type {
  ApiResponse,
  CurrentUserResponseData,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
  VerifyOtpPayload,
} from '../types/auth.types'

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/login',
      payload,
    )

    return response.data
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
      '/auth/register',
      payload,
    )

    return response.data
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/verify-otp',
      payload,
    )

    return response.data
  },

  async refreshToken() {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/refresh',
    )

    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<CurrentUserResponseData>>(
      '/auth/me',
    )

    return response.data
  },

  async logout() {
    const response = await apiClient.post<ApiResponse<undefined>>('/auth/logout')

    return response.data
  },
}
