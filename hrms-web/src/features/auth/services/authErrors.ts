import { AxiosError } from 'axios'

export const getAuthErrorMessage = (
  error: unknown,
  fallback = 'Thao tác thất bại. Vui lòng thử lại.',
) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}
