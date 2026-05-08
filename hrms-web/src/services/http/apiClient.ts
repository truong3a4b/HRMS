import axios, { AxiosError, AxiosHeaders } from 'axios'
import { tokenStorage } from './tokenStorage'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000/api'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

type RetryableRequestConfig = NonNullable<
  Parameters<typeof apiClient.request>[0]
> & {
  _retry?: boolean
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    const requestUrl = originalRequest?.url ?? ''
    const isPublicAuthRequest = [
      '/auth/login',
      '/auth/register',
      '/auth/verify-otp',
      '/auth/refresh',
    ].some((path) => requestUrl.includes(path))

    if (!originalRequest || status !== 401 || originalRequest._retry || isPublicAuthRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    refreshPromise ??= refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const token = response.data?.data?.accessToken

        if (typeof token === 'string' && token) {
          tokenStorage.setAccessToken(token)
          return token
        }

        return null
      })
      .catch(() => {
        tokenStorage.clearAccessToken()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })

    const nextToken = await refreshPromise

    if (!nextToken) {
      return Promise.reject(error)
    }

    originalRequest.headers = AxiosHeaders.from(
      originalRequest.headers as Record<string, string> | undefined,
    )
    originalRequest.headers.set('Authorization', `Bearer ${nextToken}`)
    return apiClient.request(originalRequest)
  },
)
