import { ChevronRight, Search } from 'lucide-react'
import { getTodayStats } from '../data/home.data'

function DashboardFilter() {
  return (
    <div className="mb-5 flex max-w-165 gap-2.5 rounded-lg bg-white p-2 shadow-[0_10px_25px_rgba(22,31,49,0.04)]">
      <select className="h-11.5 w-62.5 rounded-md border border-[#d1d7e2] bg-white px-3 text-lg text-[#1f3047] outline-none">
        <option value="1">1</option>
      </select>
      <input
        className="h-11.5 w-62.5 rounded-md border border-[#d1d7e2] bg-white px-3 text-lg text-[#1f3047] outline-none"
        defaultValue="2026-05-10"
        type="date"
      />
      <button
        className="h-11.5 min-w-15 rounded-md bg-[#1677d2] px-4 font-bold text-white"
        type="button"
      >
        Lọc
      </button>
      <button
        className="grid h-11.5 w-12.5 place-items-center rounded-md bg-[#74788c] text-white"
        type="button"
        aria-label="Tìm kiếm"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  )
}

function WorkShiftSummary() {
  return (
    <section className="relative min-h-70 overflow-hidden rounded-[10px] bg-[#bfe0fb]">
      <div className="relative z-[1] w-[54%] px-6 py-7">
        <span className="mb-2.5 block text-2xl text-[#39495f]">
          Tổng ca làm việc
        </span>
        <strong className="block text-5xl font-bold text-[#435264]">0</strong>
        <div className="my-6 h-px w-full bg-[#54728f38]" />
        <p className="my-1.5 text-[23px] text-[#3a4b61]">
          <b className="inline-block min-w-9.5 font-medium">0</b> Nhân viên được xếp lịch
        </p>
        <p className="my-1.5 text-[23px] text-[#3a4b61]">
          <b className="inline-block min-w-9.5 font-medium">0</b> Nhân viên đã chấm công
        </p>
      </div>
      <img
        className="absolute right-2.5 bottom-[-4px] max-h-[94%] w-[min(46%,420px)] object-contain opacity-80"
        src="/hrms-assets/people_time.png"
        alt=""
      />
    </section>
  )
}

function SalaryBanner() {
  return (
    <section
      className="relative grid min-h-34 grid-cols-[1fr_1.35fr_28px] items-center overflow-hidden rounded-[9px] bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(17,111,190,0.98), rgba(17,111,190,0.76)), url('/hrms-assets/home_background_day.jpg')",
      }}
    >
      <div className="pl-6">
        <strong className="mb-3 block text-3xl font-extrabold">0đ</strong>
        <span className="text-xl font-bold">Tổng lương ngày dự kiến</span>
      </div>
      <div className="pl-6">
        <strong className="mb-3 block text-3xl font-extrabold">0đ</strong>
        <span className="text-xl font-bold">
          Tổng lương ngày tới thời điểm hiện tại
        </span>
      </div>
      <ChevronRight className="h-7 w-7" />
    </section>
  )
}

function TodayStatsGrid() {
  return (
    <section className="grid grid-cols-4 gap-3">
      {getTodayStats().map((item) => (
        <article
          className={`min-h-24 rounded-[10px] border border-[#ebedf2] bg-white px-4 py-3.5 shadow-[0_10px_25px_rgba(22,31,49,0.04)] ${
            item.wide ? 'col-span-2' : ''
          }`}
          key={item.key}
        >
          <strong className="mb-0.5 block text-4xl leading-none text-[#73798a]">
            {item.value}
          </strong>
          <span className="text-base text-[#1b2f4a]">{item.label}</span>
        </article>
      ))}
    </section>
  )
}

function EmptyScheduleCard() {
  return (
    <section className="flex min-h-95 flex-col items-center justify-center rounded-[10px] border border-[#ebedf2] bg-white p-8 shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
      <img
        className="max-h-52.5 w-[min(350px,55%)] object-contain opacity-60"
        src="/hrms-assets/validation.png"
        alt=""
      />
      <p className="mt-6 text-[22px] text-[#1f3047]">
        Hôm nay chưa xếp lịch làm việc
      </p>
    </section>
  )
}

function KudosCard() {
  return (
    <section className="flex min-h-60 flex-col items-center justify-center rounded-[10px] border border-[#ebedf2] bg-white p-8 text-center shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
      <div className="mb-5 grid h-14.5 w-26 place-items-center rounded-[14px] bg-[#dc4d79] text-[42px] leading-none text-white shadow-[0_18px_28px_rgba(220,77,121,0.22)]">
        ♥
      </div>
      <strong className="text-[28px] text-[#dc4d79]">Tuyệt vời!</strong>
      <span className="mt-1 text-[#647084]">
        Không có cảnh báo cần xử lý trong hôm nay.
      </span>
    </section>
  )
}

export function HomeDashboard() {
  return (
    <main className="overflow-hidden px-6 py-6">
      <DashboardFilter />
      <div className="grid grid-cols-[minmax(520px,1fr)_minmax(460px,1fr)] gap-7.5 max-[1180px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-7.5">
          <WorkShiftSummary />
          <TodayStatsGrid />
          <KudosCard />
        </div>
        <div className="flex min-w-0 flex-col gap-7.5">
          <SalaryBanner />
          <EmptyScheduleCard />
        </div>
      </div>
    </main>
  )
}
