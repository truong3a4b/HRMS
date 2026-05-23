import {
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../../../app/router/paths'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField/AppTextField'
import { LogoSection } from '../../../shared/ui/LogoSection/LogoSection'
import { authService } from '../services/authService'
import { getAuthErrorMessage } from '../services/authErrors'
import { useAuth } from '../services/useAuth'
import './LoginPage.css'

type ResetPasswordFormErrors = {
  newPassword?: string
  confirmPassword?: string
}

const validateResetPasswordForm = (
  newPassword: string,
  confirmPassword: string,
) => {
  const errors: ResetPasswordFormErrors = {}

  if (!newPassword.trim()) {
    errors.newPassword = 'Mật khẩu mới không được để trống'
  } else if (newPassword.trim().length < 6) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }

  return errors
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const routeState = location.state as { email?: string; resetToken?: string } | null
  const email = routeState?.email ?? ''
  const resetToken = routeState?.resetToken ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({})
  const [feedback, setFeedback] = useState<string>()
  const [isSuccess, setIsSuccess] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  if (!resetToken) {
    return <Navigate to={paths.forgotPassword} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)
    setIsSuccess(false)

    const nextErrors = validateResetPasswordForm(newPassword, confirmPassword)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsLoading(true)
      await authService.resetPassword({
        resetToken,
        newPassword: newPassword.trim(),
      })
      setIsSuccess(true)
      setFeedback('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.')
      window.setTimeout(() => {
        navigate(paths.login, {
          replace: true,
          state: { message: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.' },
        })
      }, 900)
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng xác thực OTP lại.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Đặt lại mật khẩu HRMS">
        <div className="login-shell__hero">
          <Link aria-label="Quay lại xác thực OTP" className="login-shell__back" to={paths.forgotPassword}>
            <ArrowLeftOutlined />
          </Link>
          <LogoSection />
        </div>

        <div className="login-shell__panel is-otp">
          <form className="login-form otp-form" onSubmit={handleSubmit} noValidate>
            <h2>Đổi mật khẩu</h2>
            <p className="otp-form__description">
              Đặt mật khẩu mới cho <strong>{email}</strong>
            </p>

            <AppTextField
              autoComplete="new-password"
              error={errors.newPassword}
              leftIcon={<LockOutlined />}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mật khẩu mới"
              rightAction={
                <button
                  aria-label={isPasswordVisible ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  className="login-form__icon-button"
                  onClick={() => setIsPasswordVisible((value) => !value)}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              }
              type={isPasswordVisible ? 'text' : 'password'}
              value={newPassword}
            />

            <AppTextField
              autoComplete="new-password"
              error={errors.confirmPassword}
              leftIcon={<LockOutlined />}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              rightAction={
                <button
                  aria-label={
                    isConfirmPasswordVisible ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                  }
                  className="login-form__icon-button"
                  onClick={() => setIsConfirmPasswordVisible((value) => !value)}
                  type="button"
                >
                  {isConfirmPasswordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              }
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              value={confirmPassword}
            />

            <AppButton isLoading={isLoading} type="submit">
              Cập nhật mật khẩu
            </AppButton>

            {feedback ? (
              <p className={`login-form__feedback${isSuccess ? '' : ' is-error'}`}>
                {feedback}
              </p>
            ) : null}

            {isSuccess ? (
              <p className="login-form__register">
                Quay lại <Link to={paths.login}>đăng nhập</Link>
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  )
}
