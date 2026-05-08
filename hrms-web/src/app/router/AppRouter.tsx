import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { VerifyOtpPage } from '../../features/auth/pages/VerifyOtpPage'
import { HomePage } from '../../features/home/pages/HomePage'
import { ProtectedRoute } from './ProtectedRoute'
import { paths } from './paths'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={paths.home} replace />} />
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path={paths.verifyOtp} element={<VerifyOtpPage />} />
      <Route
        path={paths.home}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
