import type { RecruitmentJob } from '../../models/home.models'

interface JobCardProps {
  job: RecruitmentJob
  onTap: () => void
}

const statusColors = {
  active: '#52c41a',
  closed: '#ff4d4f',
  draft: '#fa8c16',
} as const

const statusText = {
  active: 'Đang tuyển',
  closed: 'Đã đóng',
  draft: 'Nháp',
} as const

export function JobCard({ job, onTap }: JobCardProps) {
  return (
    <div className="job-card" onClick={onTap} role="button" tabIndex={0}>
      <div className="job-card__header">
        <h3 className="job-card__title">{job.title}</h3>
        <span
          className="job-card__status"
          style={{ backgroundColor: statusColors[job.status] }}
        >
          {statusText[job.status]}
        </span>
      </div>

      <div className="job-card__details">
        <div className="job-card__detail">
          <span className="material-icons">business</span>
          <span>{job.department}</span>
        </div>
        <div className="job-card__detail">
          <span className="material-icons">location_on</span>
          <span>{job.location}</span>
        </div>
        <div className="job-card__detail">
          <span className="material-icons">payments</span>
          <span>{job.salaryRange}</span>
        </div>
      </div>

      <div className="job-card__footer">
        <span className="job-card__applications">
          {job.applicationCount} người đã ứng tuyển
        </span>
        <span className="job-card__deadline">
          Hạn: {job.deadline}
        </span>
      </div>
    </div>
  )
}

interface JobSectionProps {
  jobs: RecruitmentJob[]
  onSeeMore: () => void
  onJobClick: (jobId: string) => void
}

export function JobSection({ jobs, onSeeMore, onJobClick }: JobSectionProps) {
  return (
    <div className="candidate-section">
      <div className="candidate-section__header">
        <h2 className="candidate-section__title">Việc đang tuyển</h2>
        <button className="candidate-section__view-more" onClick={onSeeMore}>
          Xem thêm
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="candidate-section__empty">
          Chưa có vị trí tuyển dụng phù hợp.
        </div>
      ) : (
        <div className="candidate-section__list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onTap={() => onJobClick(job.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
