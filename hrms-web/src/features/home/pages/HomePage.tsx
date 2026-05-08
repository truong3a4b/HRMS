import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from 'antd'
import { paths } from '../../../app/router/paths'
import { useAuth } from '../../auth/services/useAuth'
import { UserRole } from '../models/home.models'
import type { HomeState, Employee, Candidate, TodayStat, RecruitmentJob, JobApplication } from '../models/home.models'
import { GreetingSection } from '../components/GreetingSection/GreetingSection'
import { CheckInCard } from '../components/CheckInCard/CheckInCard'
import { HomeFeatureSection } from '../components/HomeFeatureSection/HomeFeatureSection'
import { PendingCard } from '../components/PendingCard/PendingCard'
import { TodaySummary } from '../components/TodaySummary/TodaySummary'
import { CandidateHomeSection } from '../components/CandidateHomeSection/CandidateHomeSection'
import './HomePage.css'

const navItems = [
  { label: 'Trang chủ', path: paths.home },
  { label: 'Nhân sự', path: paths.employees },
  { label: 'Phòng ban', path: paths.scheduleWeekly },
  { label: 'Tuyển dụng', path: paths.recruitmentJobs },
  { label: 'Đăng xuất', action: 'logout' as const },
]

// Mock data - replace with real API calls
const mockTodayStats: TodayStat[] = [
  { label: 'Đi muộn', value: '3', color: '#FFF4E5', icon: 'timelapse' },
  { label: 'Về sớm', value: '1', color: '#E5F9F4', icon: 'run_circle' },
  { label: 'Quên check-in', value: '1', color: '#E9EDCE', icon: 'input' },
  { label: 'Quên check-out', value: '1', color: '#F8F0E1', icon: 'output' },
  { label: 'Nghỉ phép', value: '1', color: '#ECE1FB', icon: 'beach_access' },
  { label: 'Nghỉ không phép', value: '1', color: '#F8CFCF', icon: 'do_not_disturb_on_outlined' },
]

const mockJobs: RecruitmentJob[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Hà Nội',
    salaryRange: '25-40 triệu VNĐ',
    status: 'active',
    applicationCount: 12,
    deadline: '30/05/2026',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Hồ Chí Minh',
    salaryRange: '15-25 triệu VNĐ',
    status: 'active',
    applicationCount: 8,
    deadline: '25/05/2026',
  },
]

const mockApplications: JobApplication[] = [
  {
    id: '1',
    jobTitle: 'Senior React Developer',
    company: 'Tech Corp',
    status: 'reviewing',
    appliedDate: '01/05/2026',
    jobId: '1',
  },
  {
    id: '2',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio',
    status: 'interview',
    appliedDate: '28/04/2026',
    jobId: '2',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18

  // Mock state - replace with actual state management
  const mockHomeState: HomeState = {
    me: user as Employee | Candidate,
    role: (user?.role as UserRole) || UserRole.employee,
    pendingCount: 3,
    todayStats: mockTodayStats,
    jobs: mockJobs,
    applications: mockApplications,
  }

  const { me, role, pendingCount, todayStats, jobs, applications } = mockHomeState

  const handleLogout = async () => {
    await logout()
    navigate(paths.login, { replace: true })
    setDrawerOpen(false)
  }

  const handleNavClick = (action?: string, path?: string) => {
    if (action === 'logout') {
      handleLogout()
    } else if (path) {
      navigate(path)
      setDrawerOpen(false)
    }
  }

  const handleViewMore = () => {
    console.log('View more clicked')
  }

  const getPosition = (): string => {
    if (me && 'position' in me && (me as Employee).position) {
      return (me as Employee).position?.name || 'Nhân viên'
    }
    return 'Ứng viên'
  }

  const showCheckInCard = role === UserRole.employee
  const showPendingCard = role === UserRole.admin
  const showFeatureSection = role === UserRole.employee
  const showTodayTaskSection = role === UserRole.employee
  const showTodaySummary = role === UserRole.admin
  const showCandidateHome = role === UserRole.candidate

  return (
    <>
      <Drawer
        title="HRMS Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="home-drawer"
      >
        <nav className="drawer-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="drawer-nav__item"
              onClick={() => handleNavClick(item.action, item.path)}
            >
              <span className="drawer-nav__icon">
                {item.label === 'Đăng xuất' ? '🚪' : ''}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </Drawer>

      <main className="home-page">
        <header className="home-header">
          <button
            className="home-header__menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="home-header__content">
            <span className="home-header__eyebrow">HRMS</span>
            <h1>Trang chủ</h1>
            {user?.email && <p>{user.email}</p>}
          </div>
          <button className="home-header__logout" onClick={handleLogout} type="button">
            Đăng xuất
          </button>
        </header>

        <div className="home-hero-section">
          <div
            className="home-hero__background"
            style={{
              backgroundImage: `url(${isDay ? '/home-background-day.jpg' : '/home-background-night.jpg'})`,
            }}
          >
            <div className="home-hero__gradient" />
          </div>

          <GreetingSection
            name={me?.name || ''}
            position={getPosition()}
            role={role}
            avatarUrl={me && 'avatarUrl' in me ? me.avatarUrl : undefined}
            isDay={isDay}
          />
        </div>

        <div className="home-content">
          {showCheckInCard && (
            <>
              <CheckInCard />
              <div className="home-spacer" />
            </>
          )}

          {showFeatureSection && (
            <>
              <HomeFeatureSection />
              <div className="home-spacer" />
            </>
          )}

          {showPendingCard && (
            <>
              <PendingCard count={pendingCount} onClick={handleViewMore} />
              <div className="home-spacer" />
            </>
          )}

          {showTodayTaskSection && (
            <>
              <section className="today-task-section">
                <h2 className="today-task-section__title">Công việc hôm nay</h2>
                <div className="today-task-card" onClick={handleViewMore}>
                  <div className="today-task-card__content">
                    <h3>Bảo trì hệ thống máy chủ</h3>
                    <div className="today-task-card__meta">
                      <span className="today-task-card__status">Đang tiến hành</span>
                      <span className="today-task-card__deadline">Hạn chót: 31/05/2026</span>
                    </div>
                  </div>
                </div>
              </section>
              <div className="home-spacer" />
            </>
          )}

          {showTodaySummary && (
            <>
              <TodaySummary stats={todayStats} onViewMore={handleViewMore} />
              <div className="home-spacer" />
            </>
          )}

          {showCandidateHome && jobs && applications && (
            <CandidateHomeSection
              jobs={jobs}
              applications={applications}
              onSeeMoreJobs={handleViewMore}
              onSeeMoreApplications={handleViewMore}
              onJobClick={(jobId) => console.log('Job clicked:', jobId)}
              onApplicationClick={(appId) => console.log('Application clicked:', appId)}
            />
          )}
        </div>
      </main>
    </>
  )
}
