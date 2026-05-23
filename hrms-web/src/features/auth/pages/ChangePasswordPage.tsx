import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../../app/layouts'
import { paths } from '../../../app/router/paths'
import { AppButton } from '../../../shared/ui/AppButton/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField/AppTextField'
import { authService } from '../services/authService'
import { getAuthErrorMessage } from '../services/authErrors'
import { useAuth } from '../services/useAuth'
import './LoginPage.css'

type ChangePasswordFormErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const validateChangePasswordForm = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const errors: ChangePasswordFormErrors = {}

  if (!currentPassword.trim()) {
    errors.currentPassword = 'Mật khẩu hiện tại không được để trống'
  }

  if (!newPassword.trim()) {
    errors.newPassword = 'Mật khẩu mới không được để trống'
  } else if (newPassword.trim().length < 6) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
  } else if (currentPassword && currentPassword === newPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }

  return errors
}

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [visibleField, setVisibleField] = useState<
    'current' | 'new' | 'confirm' | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ChangePasswordFormErrors>({})
  const [feedback, setFeedback] = useState<string>()

  const passwordAction = (field: 'current' | 'new' | 'confirm', label: string) => (
    <button
      aria-label={visibleField === field ? `Ẩn ${label}` : `Hiện ${label}`}
      className="login-form__icon-button"
      onClick={() => setVisibleField((value) => (value === field ? null : field))}
      type="button"
    >
      {visibleField === field ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    </button>
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(undefined)

    const nextErrors = validateChangePasswordForm(
      currentPassword,
      newPassword,
      confirmPassword,
    )
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsLoading(true)
      await authService.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      })
      await logout()
      navigate(paths.login, {
        replace: true,
        state: { message: 'Mật khẩu đã được đổi. Vui lòng đăng nhập lại.' },
      })
    } catch (error) {
      setFeedback(getAuthErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto bg-[#f7f9fc]">
        <div className="mx-auto grid w-full max-w-[720px] gap-5 px-5 py-6 max-[640px]:px-4">
          <section className="rounded-lg border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
            <div className="border-b border-[#eaecf0] px-6 py-5">
              <h1 className="text-xl font-bold text-[#101828]">Đổi mật khẩu</h1>
              <p className="mt-1 text-sm text-[#667085]">
                Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.
              </p>
            </div>

            <form className="grid gap-5 px-6 py-6" onSubmit={handleSubmit} noValidate>
              <AppTextField
                autoComplete="current-password"
                error={errors.currentPassword}
                leftIcon={<LockOutlined />}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Mật khẩu hiện tại"
                rightAction={passwordAction('current', 'mật khẩu hiện tại')}
                type={visibleField === 'current' ? 'text' : 'password'}
                value={currentPassword}
              />

              <AppTextField
                autoComplete="new-password"
                error={errors.newPassword}
                leftIcon={<LockOutlined />}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mật khẩu mới"
                rightAction={passwordAction('new', 'mật khẩu mới')}
                type={visibleField === 'new' ? 'text' : 'password'}
                value={newPassword}
              />

              <AppTextField
                autoComplete="new-password"
                error={errors.confirmPassword}
                leftIcon={<LockOutlined />}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                rightAction={passwordAction('confirm', 'mật khẩu xác nhận')}
                type={visibleField === 'confirm' ? 'text' : 'password'}
                value={confirmPassword}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                {feedback ? (
                  <p className="m-0 text-sm font-medium text-[#b42318]">{feedback}</p>
                ) : (
                  <span />
                )}
                <AppButton isLoading={isLoading} type="submit">
                  Cập nhật mật khẩu
                </AppButton>
              </div>
            </form>
          </section>
        </div>
      </main>
    </AppLayout>
  )
}
