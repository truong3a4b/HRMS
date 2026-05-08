import React from 'react'
import { Card, Typography } from 'antd'
import type { AttendanceStat } from '../models/dashboard.models'
import './StatCard.css'

const { Text } = Typography

interface StatCardProps {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  return (
    <Card className="stat-card" bordered={false}>
      <div className="stat-card__content">
        <div className="stat-card__icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stat-card__info">
          <Text className="stat-card__label">{label}</Text>
          <Text className="stat-card__value">{value}</Text>
        </div>
      </div>
    </Card>
  )
}
