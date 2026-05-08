import type { UserRole } from '../../models/home.models'

interface GreetingSectionProps {
  name: string
  position?: string
  role: UserRole
  avatarUrl?: string
  isDay: boolean
}

export function GreetingSection({
  name,
  position,
  role: _role,
  avatarUrl = '/profile-placeholder.png',
  isDay,
}: GreetingSectionProps) {
  const greeting = isDay ? 'Chào buổi sáng' : 'Chào buổi tối'

  return (
    <section className="greeting-section">
      <h1 className="greeting-section__greeting">{greeting}</h1>

      <div className="greeting-section__user">
        <div className="greeting-section__avatar">
          <img
            src={avatarUrl}
            alt={name}
            className="greeting-section__avatar-img"
          />
        </div>

        <div className="greeting-section__info">
          <h2 className="greeting-section__name">{name}</h2>

          {position && (
            <span className="greeting-section__position-badge">
              {position}
            </span>
          )}
        </div>
      </div>

      <p className="greeting-section__motivation">
        Chúc bạn một ngày làm việc hiệu quả
      </p>
    </section>
  )
}
