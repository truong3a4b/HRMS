import { ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/services/AuthProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0e67b2',
          borderRadius: 8,
          fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, Arial, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}
