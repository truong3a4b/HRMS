import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../../../app/router/paths'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { LogoSection } from '../../../shared/ui/LogoSection/LogoSection'
import { getAuthErrorMessage } from '../services/authErrors'
import { useAuth } from '../services/useAuth'
import './LoginPage.css'

const otpLength = 6

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, register, verifyOtp } = useAuth()
  const routeState = location.state as { email?: string; password?: string } | null
  const email = routeState?.email ?? ''
  const password = routeState?.password ?? ''
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [digits, setDigits] = useState<string[]>(Array(otpLength).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [feedback, setFeedback] = useState<string>()

  const otp = useMemo(() => digits.join(''), [digits])

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  if (!email) {
    return <Navigate to={paths.register} replace />
  }

  const updateDigit = (value: string, index: number) => {
    const nextDigit = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = nextDigit
    setDigits(nextDigits)

    if (nextDigit && index < otpLength - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    updateDigit(event.target.value, index)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, otpLength)
      .split('')

    if (pastedDigits.length === 0) {
      return
    }

    const nextDigits = Array(otpLength).fill('')
    pastedDigits.forEach((digit, index) => {
      nextDigits[index] = digit
    })
    setDigits(nextDigits)
    inputsRef.current[Math.min(pastedDigits.length, otpLength) - 1]?.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)

    if (otp.length !== otpLength) {
      setFeedback('Vui lòng nhập đủ 6 chữ số')
      return
    }

    try {
      setIsLoading(true)
      await verifyOtp({ email, otp })
      navigate(paths.home, { replace: true })
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Xác thực OTP thất bại. Vui lòng thử lại.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setFeedback(undefined)

    try {
      setIsResending(true)
      if (!password) {
        setFeedback('Vui lòng quay lại màn hình đăng ký để gửi lại mã xác thực.')
        return
      }

      await register({ email, password })
      setFeedback('Mã xác thực mới đã được gửi tới email của bạn.')
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Không thể gửi lại OTP. Vui lòng thử lại.'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Xác thực OTP HRMS">
        <div className="login-shell__hero">
          <Link aria-label="Quay lại đăng ký" className="login-shell__back" to={paths.register}>
            <ArrowLeftOutlined />
          </Link>
          <LogoSection />
        </div>

        <div className="login-shell__panel is-otp">
          <form className="login-form otp-form" onSubmit={handleSubmit} noValidate>
            <h2>Nhập mã xác thực</h2>
            <p className="otp-form__description">
              Mã xác thực được gửi về email <strong>{email}</strong>
            </p>

            <div className="otp-form__notice">
              Nếu không thấy email, hãy kiểm tra mục thư rác và đánh dấu không phải spam.
            </div>

            <div className="otp-form__boxes">
              {digits.map((digit, index) => (
                <input
                  aria-label={`Số OTP thứ ${index + 1}`}
                  className="otp-form__box"
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => handleChange(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  ref={(element) => {
                    inputsRef.current[index] = element
                  }}
                  type="text"
                  value={digit}
                />
              ))}
            </div>

            <button
              className="login-form__link otp-form__resend"
              disabled={isResending}
              onClick={handleResendOtp}
              type="button"
            >
              {isResending ? 'Đang gửi lại...' : 'Gửi lại mã xác thực'}
            </button>

            <AppButton isLoading={isLoading} type="submit">
              Xác thực
            </AppButton>

            {feedback ? <p className="login-form__feedback">{feedback}</p> : null}
          </form>
        </div>
      </section>
    </main>
  )
}
