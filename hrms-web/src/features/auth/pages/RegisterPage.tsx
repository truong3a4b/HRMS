import {
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { paths } from '../../../app/router/paths'
import googleIcon from '../../../shared/assets/google.png'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField/AppTextField'
import { LogoSection } from '../../../shared/ui/LogoSection/LogoSection'
import { getAuthErrorMessage } from '../services/authErrors'
import { useAuth } from '../services/useAuth'
import './LoginPage.css'

type RegisterFormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
) => {
  const errors: RegisterFormErrors = {}

  if (!email.trim()) {
    errors.email = 'Email không được để trống'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Email không hợp lệ'
  }

  if (!password.trim()) {
    errors.password = 'Mật khẩu không được để trống'
  } else if (password.trim().length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }

  return errors
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [feedback, setFeedback] = useState<string>()

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)

    const nextErrors = validateRegisterForm(email, password, confirmPassword)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsLoading(true)
      const registeredEmail = await register({
        email: email.trim(),
        password: password.trim(),
      })
      navigate(paths.verifyOtp, {
        replace: true,
        state: { email: registeredEmail, password: password.trim() },
      })
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Đăng ký HRMS">
        <div className="login-shell__hero">
          <Link aria-label="Quay lại đăng nhập" className="login-shell__back" to={paths.login}>
            <ArrowLeftOutlined />
          </Link>
          <LogoSection />
        </div>

        <div className="login-shell__panel">
          <div className="login-panel__visual" aria-hidden="true">
            <div className="login-panel__visual-content">
              <span className="login-panel__badge">Tài khoản mới</span>
              <h1>Bắt đầu hồ sơ nhân sự</h1>
              <p>Tạo tài khoản, xác thực email bằng OTP và truy cập vào hệ thống HRMS.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2>Đăng ký</h2>

            <AppTextField
              autoComplete="email"
              error={errors.email}
              leftIcon={<MailOutlined />}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={email}
            />

            <AppTextField
              autoComplete="new-password"
              error={errors.password}
              leftIcon={<LockOutlined />}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mật khẩu"
              rightAction={
                <button
                  aria-label={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="login-form__icon-button"
                  onClick={() => setIsPasswordVisible((value) => !value)}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              }
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
            />

            <AppTextField
              autoComplete="new-password"
              error={errors.confirmPassword}
              leftIcon={<LockOutlined />}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
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
              Đăng ký
            </AppButton>

            <div className="login-form__divider">
              <span />
              <strong>Hoặc</strong>
              <span />
            </div>

            <button className="login-form__google" type="button">
              <img alt="" height="18" src={googleIcon} width="18" />
              <span>Tiếp tục với Google</span>
            </button>

            {feedback ? <p className="login-form__feedback is-error">{feedback}</p> : null}

            <p className="login-form__register">
              Đã có tài khoản? <Link to={paths.login}>Đăng nhập</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
