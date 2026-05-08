import type { InputHTMLAttributes, ReactNode } from 'react'
import './AppTextField.css'

type AppTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  leftIcon?: ReactNode
  rightAction?: ReactNode
}

export function AppTextField({
  className = '',
  error,
  leftIcon,
  rightAction,
  ...props
}: AppTextFieldProps) {
  return (
    <label className={`app-text-field ${className}`.trim()}>
      <span className={`app-text-field__control ${error ? 'is-invalid' : ''}`}>
        {leftIcon ? <span className="app-text-field__icon">{leftIcon}</span> : null}
        <input {...props} />
        {rightAction ? (
          <span className="app-text-field__action">{rightAction}</span>
        ) : null}
      </span>
      {error ? <span className="app-text-field__error">{error}</span> : null}
    </label>
  )
}
