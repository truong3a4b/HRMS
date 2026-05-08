import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../../../app/router/paths'
import googleIcon from '../../../shared/assets/google.png'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField/AppTextField'
import { LogoSection } from '../../../shared/ui/LogoSection/LogoSection'
import { getAuthErrorMessage } from '../services/authErrors'
import { useAuth } from '../services/useAuth'
import './LoginPage.css'

type LoginFormErrors = {
  email?: string
  password?: string
}

const validateLoginForm = (email: string, password: string) => {
  const errors: LoginFormErrors = {}

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

  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, status } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [feedback, setFeedback] = useState<string>()

  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname

  if (isAuthenticated) {
    return <Navigate to={from ?? paths.home} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)

    const nextErrors = validateLoginForm(email, password)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsLoading(true)
      await login({
        email: email.trim(),
        password: password.trim(),
      })
      navigate(from ?? paths.home, { replace: true })
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Đăng nhập HRMS">
        <div className="login-shell__hero">
          <LogoSection />
        </div>

        <div className="login-shell__panel">
          <div className="login-panel__visual" aria-hidden="true">
            <div className="login-panel__visual-content">
              <span className="login-panel__badge">HRMS Web</span>
              <h1>Quản trị nhân sự tập trung</h1>
              <p>Theo dõi nhân sự, phòng ban, tuyển dụng và yêu cầu nội bộ trong một giao diện nhất quán.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2>Đăng nhập</h2>

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
              autoComplete="current-password"
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

            <AppButton disabled={status === 'checking'} isLoading={isLoading} type="submit">
              Đăng nhập
            </AppButton>

            <button className="login-form__link" type="button">
              Quên mật khẩu
            </button>

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
              Bạn chưa có tài khoản? <Link to={paths.register}>Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
