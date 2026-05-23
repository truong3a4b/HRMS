import {
  ArrowLeftOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
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

type ForgotPasswordFormErrors = {
  email?: string
  otp?: string
}

const validateEmail = (email: string) => {
  if (!email.trim()) return 'Email không được để trống'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Email không hợp lệ'
  return undefined
}

const validateOtp = (otp: string) => {
  if (!otp.trim()) return 'Mã xác nhận không được để trống'
  if (!/^\d{6}$/.test(otp.trim())) return 'Mã xác nhận gồm 6 chữ số'
  return undefined
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const routeState = location.state as { email?: string } | null
  const [email, setEmail] = useState(routeState?.email ?? '')
  const [otp, setOtp] = useState('')
  const [hasOtpSent, setHasOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({})
  const [feedback, setFeedback] = useState<string>()
  const [feedbackTone, setFeedbackTone] = useState<'info' | 'error'>('info')

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  const handleSendOtp = async () => {
    setFeedback(undefined)
    setFeedbackTone('info')

    const emailError = validateEmail(email)
    setErrors(emailError ? { email: emailError } : {})

    if (emailError) return

    try {
      setIsSendingOtp(true)
      const response = await authService.forgotPassword({ email: email.trim() })
      setEmail(response.data.email)
      setHasOtpSent(true)
      setFeedbackTone('info')
      setFeedback('Mã xác nhận đã được gửi đến email đã đăng ký.')
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(getAuthErrorMessage(error, 'Email chưa được đăng ký hoặc không thể gửi mã xác nhận.'))
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)
    setFeedbackTone('info')

    if (!hasOtpSent) {
      await handleSendOtp()
      return
    }

    const otpError = validateOtp(otp)
    setErrors(otpError ? { otp: otpError } : {})

    if (otpError) return

    try {
      setIsVerifyingOtp(true)
      const response = await authService.verifyResetOtp({
        email: email.trim(),
        otp: otp.trim(),
      })
      navigate(paths.resetPassword, {
        replace: true,
        state: {
          email: response.data.email,
          resetToken: response.data.resetToken,
        },
      })
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(getAuthErrorMessage(error, 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Quên mật khẩu HRMS">
        <div className="login-shell__hero">
          <Link aria-label="Quay lại đăng nhập" className="login-shell__back" to={paths.login}>
            <ArrowLeftOutlined />
          </Link>
          <LogoSection />
        </div>

        <div className="login-shell__panel is-otp">
          <form className="login-form otp-form" onSubmit={handleSubmit} noValidate>
            <h2>{hasOtpSent ? 'Xác thực OTP' : 'Quên mật khẩu'}</h2>
            <p className="otp-form__description">
              {hasOtpSent
                ? 'Nhập mã xác nhận được gửi đến email đã đăng ký.'
                : 'Dùng email đã đăng ký tài khoản HRMS để nhận mã xác nhận.'}
            </p>

            <AppTextField
              autoComplete="email"
              disabled={hasOtpSent}
              error={errors.email}
              leftIcon={<MailOutlined />}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email đã đăng ký"
              type="email"
              value={email}
            />

            {hasOtpSent ? (
              <AppTextField
                autoComplete="one-time-code"
                error={errors.otp}
                leftIcon={<SafetyCertificateOutlined />}
                maxLength={6}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Mã xác nhận"
                type="text"
                value={otp}
              />
            ) : null}

            <AppButton isLoading={hasOtpSent ? isVerifyingOtp : isSendingOtp} type="submit">
              {hasOtpSent ? 'Xác thực OTP' : 'Gửi mã xác nhận'}
            </AppButton>

            {hasOtpSent ? (
              <button
                className="login-form__link otp-form__resend"
                disabled={isSendingOtp}
                onClick={handleSendOtp}
                type="button"
              >
                {isSendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã xác nhận'}
              </button>
            ) : null}

            {feedback ? (
              <p className={`login-form__feedback${feedbackTone === 'error' ? ' is-error' : ''}`}>
                {feedback}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  )
}
