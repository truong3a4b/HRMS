export interface FeatureCard {
  icon: string
  title: string
  subtitle?: string
  onClick?: () => void
}

interface HomeFeatureSectionProps {
  features?: FeatureCard[]
}

const defaultFeatures: FeatureCard[] = [
  {
    icon: '/schedule-icon.png',
    title: 'Lịch làm việc',
    subtitle: '',
  },
  {
    icon: '/leave-icon.png',
    title: 'Đăng ký nghỉ',
    subtitle: '',
  },
  {
    icon: '/salary-icon.png',
    title: 'Kỳ lương',
    subtitle: '',
  },
  {
    icon: '/newspaper-icon.png',
    title: 'Bảng tin',
    subtitle: '',
  },
]

export function HomeFeatureSection({ features = defaultFeatures }: HomeFeatureSectionProps) {
  return (
    <section className="home-feature-section">
      <h2 className="home-feature-section__title">Tính năng nhanh</h2>

      <div className="home-feature-section__grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="home-feature-card"
            onClick={feature.onClick}
            role={feature.onClick ? 'button' : undefined}
            tabIndex={feature.onClick ? 0 : undefined}
          >
            <div className="home-feature-card__icon">
              <img
                src={feature.icon}
                alt=""
                className="home-feature-card__icon-img"
              />
            </div>

            <h3 className="home-feature-card__title">{feature.title}</h3>

            {feature.subtitle && (
              <p className="home-feature-card__subtitle">{feature.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
