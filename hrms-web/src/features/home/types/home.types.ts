import type { ReactNode } from 'react'

export type DrawerItem = {
  key: string
  label: string
  icon: ReactNode
  badge?: number
  expandable?: boolean
}

export type StatItem = {
  key: string
  value: string
  label: string
  wide?: boolean
}

export type AccountAction = {
  key: string
  title: string
  subtitle?: string
  icon: ReactNode
  danger?: boolean
  onClick?: () => void
}

export type NotificationItem = {
  key: string
  title: string
  message: string
  time: string
}
