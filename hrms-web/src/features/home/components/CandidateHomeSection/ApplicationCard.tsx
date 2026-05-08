import type { JobApplication } from '../../models/home.models'

interface ApplicationCardProps {
  application: JobApplication
  onTap: () => void
}

const statusConfig = {
  pending: { color: '#fa8c16', label: 'Chờ duyệt' },
  reviewing: { color: '#1890ff', label: 'Đang xem xét' },
  interview: { color: '#722ed1', label: 'Phỏng vấn' },
  accepted: { color: '#52c41a', label: 'Đã nhận' },
  rejected: { color: '#ff4d4f', label: 'Từ chối' },
} as const

export function ApplicationCard({ application, onTap }: ApplicationCardProps) {
  const config = statusConfig[application.status]

  return (
    <div className="application-card" onClick={onTap} role="button" tabIndex={0}>
      <div className="application-card__header">
        <h3 className="application-card__title">{application.jobTitle}</h3>
        <span
          className="application-card__status"
          style={{ backgroundColor: config.color }}
        >
          {config.label}
        </span>
      </div>

      <div className="application-card__company">
        <span className="material-icons">business</span>
        <span>{application.company}</span>
      </div>

      <div className="application-card__footer">
        <span className="application-card__date">
          Ứng tuyển: {application.appliedDate}
        </span>
      </div>
    </div>
  )
}

interface ApplicationSectionProps {
  applications: JobApplication[]
  onSeeMore: () => void
  onApplicationClick: (applicationId: string) => void
}

export function ApplicationSection({
  applications,
  onSeeMore,
  onApplicationClick,
}: ApplicationSectionProps) {
  return (
    <div className="candidate-section candidate-section--applications">
      <div className="candidate-section__header">
        <h2 className="candidate-section__title">Đơn ứng tuyển của tôi</h2>
        <button className="candidate-section__view-more" onClick={onSeeMore}>
          Xem thêm
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="candidate-section__empty">
          Bạn chưa ứng tuyển công việc nào.
        </div>
      ) : (
        <div className="candidate-section__list">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onTap={() => onApplicationClick(application.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
