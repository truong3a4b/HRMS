import { Navigate, useLocation } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuth } from '../../features/auth/services/useAuth'
import { paths } from './paths'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()
  const { status } = useAuth()

  if (status === 'checking') {
    return <div className="route-loader">Đang kiểm tra phiên đăng nhập...</div>
  }

  if (status !== 'authenticated') {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  return children
}
