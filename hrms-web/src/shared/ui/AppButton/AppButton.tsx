import type { ButtonHTMLAttributes } from 'react'
import './AppButton.css'

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
}

export function AppButton({
  children,
  className = '',
  disabled,
  isLoading = false,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`app-button ${className}`.trim()}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? <span className="app-button__spinner" /> : children}
    </button>
  )
}
