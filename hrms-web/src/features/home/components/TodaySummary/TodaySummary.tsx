import type { TodayStat } from '../../models/home.models'

interface TodaySummaryProps {
  stats?: TodayStat[]
  onViewMore?: () => void
}

const defaultStats: TodayStat[] = [
  {
    label: 'Đi muộn',
    value: '3',
    color: '#FFF4E5',
    icon: 'timelapse',
  },
  {
    label: 'Về sớm',
    value: '1',
    color: '#E5F9F4',
    icon: 'run_circle',
  },
  {
    label: 'Quên check-in',
    value: '1',
    color: '#E9EDCE',
    icon: 'input',
  },
  {
    label: 'Quên check-out',
    value: '1',
    color: '#F8F0E1',
    icon: 'output',
  },
  {
    label: 'Nghỉ phép',
    value: '1',
    color: '#ECE1FB',
    icon: 'beach_access',
  },
  {
    label: 'Nghỉ không phép',
    value: '1',
    color: '#F8CFCF',
    icon: 'do_not_disturb_on_outlined',
  },
]

export function TodaySummary({ stats = defaultStats, onViewMore }: TodaySummaryProps) {
  return (
    <section className="today-summary">
      <div className="today-summary__header">
        <h2 className="today-summary__title">Hôm nay</h2>
        {onViewMore && (
          <button className="today-summary__view-more" onClick={onViewMore}>
            Xem thêm
          </button>
        )}
      </div>

      <div className="today-summary__grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="today-summary__card"
            style={{ backgroundColor: stat.color }}
          >
            <div className="today-summary__card-icon">
              <span className={`material-icons today-summary__icon-${stat.icon}`}>
                {stat.icon}
              </span>
            </div>

            <div className="today-summary__card-content">
              <span className="today-summary__card-value">{stat.value}</span>
              <span className="today-summary__card-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
