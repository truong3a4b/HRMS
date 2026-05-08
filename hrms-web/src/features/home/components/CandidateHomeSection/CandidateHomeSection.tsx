import { JobSection } from './JobCard'
import { ApplicationSection } from './ApplicationCard'
import type { RecruitmentJob, JobApplication } from '../../models/home.models'

interface CandidateHomeSectionProps {
  jobs: RecruitmentJob[]
  applications: JobApplication[]
  onSeeMoreJobs: () => void
  onSeeMoreApplications: () => void
  onJobClick: (jobId: string) => void
  onApplicationClick: (applicationId: string) => void
}

export function CandidateHomeSection({
  jobs,
  applications,
  onSeeMoreJobs,
  onSeeMoreApplications,
  onJobClick,
  onApplicationClick,
}: CandidateHomeSectionProps) {
  return (
    <div className="candidate-home-section">
      <JobSection
        jobs={jobs}
        onSeeMore={onSeeMoreJobs}
        onJobClick={onJobClick}
      />

      <ApplicationSection
        applications={applications}
        onSeeMore={onSeeMoreApplications}
        onApplicationClick={onApplicationClick}
      />
    </div>
  )
}
