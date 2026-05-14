import { ChevronRight, Search } from "lucide-react";
import { getTodayStats } from "../data/home.data";

function DashboardFilter() {
  return (
    <div className="mb-5 flex max-w-150 flex-wrap gap-2 rounded-lg bg-white p-2 shadow-[0_10px_25px_rgba(22,31,49,0.04)]">
      <input
        className="h-10.5 min-w-42 flex-1 rounded-md border border-[#d1d7e2] bg-white px-3 text-base text-[#1f3047] outline-none"
        defaultValue="2026-05-10"
        type="date"
      />
      <button
        className="h-10.5 min-w-14 rounded-md bg-[#1677d2] px-4 font-bold text-white"
        type="button"
      >
        Lọc
      </button>
      <button
        className="grid h-10.5 w-11.5 place-items-center rounded-md bg-[#74788c] text-white"
        type="button"
        aria-label="Tìm kiếm"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}

function WorkShiftSummary() {
  return (
    <section className="relative min-h-60 overflow-hidden rounded-[10px] bg-[#bfe0fb]">
      <div className="relative z-[1] w-[58%] px-5 py-6 max-[680px]:w-full max-[680px]:pr-28">
        <span className="mb-2.5 block text-xl text-[#39495f]">
          Tổng ca làm việc
        </span>
        <strong className="block text-4xl font-bold text-[#435264]">0</strong>
        <div className="my-5 h-px w-full bg-[#54728f38]" />
        <p className="my-1.5 text-lg text-[#3a4b61]">
          <b className="inline-block min-w-9.5 font-medium">0</b> Nhân viên được
          xếp lịch
        </p>
        <p className="my-1.5 text-lg text-[#3a4b61]">
          <b className="inline-block min-w-9.5 font-medium">0</b> Nhân viên đã
          chấm công
        </p>
      </div>
      <img
        className="absolute right-2.5 bottom-[-4px] max-h-[92%] w-[min(42%,340px)] object-contain opacity-80 max-[680px]:w-34"
        src="/hrms-assets/people_time.png"
        alt=""
      />
    </section>
  );
}

function SalaryBanner() {
  return (
    <section
      className="relative grid min-h-30 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_24px] items-center overflow-hidden rounded-[9px] bg-cover bg-center text-white max-[720px]:grid-cols-[1fr_24px]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(17,111,190,0.98), rgba(17,111,190,0.76)), url('/hrms-assets/home_background_day.jpg')",
      }}
    >
      <div className="pl-5">
        <strong className="mb-2 block text-2xl font-extrabold">0đ</strong>
        <span className="text-base font-bold">Tổng lương ngày dự kiến</span>
      </div>
      <div className="pl-5 max-[720px]:hidden">
        <strong className="mb-2 block text-2xl font-extrabold">0đ</strong>
        <span className="text-base font-bold">
          Tổng lương ngày tới thời điểm hiện tại
        </span>
      </div>
      <ChevronRight className="h-7 w-7" />
    </section>
  );
}

function TodayStatsGrid() {
  return (
    <section className="grid grid-cols-4 gap-3 max-[720px]:grid-cols-2">
      {getTodayStats().map((item) => (
        <article
          className={`min-h-22 rounded-[10px] border border-[#ebedf2] bg-white px-4 py-3.5 shadow-[0_10px_25px_rgba(22,31,49,0.04)] ${
            item.wide ? "col-span-2" : ""
          }`}
          key={item.key}
        >
          <strong className="mb-0.5 block text-3xl leading-none text-[#73798a]">
            {item.value}
          </strong>
          <span className="text-base text-[#1b2f4a]">{item.label}</span>
        </article>
      ))}
    </section>
  );
}

function EmptyScheduleCard() {
  return (
    <section className="flex min-h-95 flex-col items-center justify-center rounded-[10px] border border-[#ebedf2] bg-white p-8 shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
      <img
        className="max-h-52.5 w-[min(350px,55%)] object-contain opacity-60"
        src="/hrms-assets/validation.png"
        alt=""
      />
      <p className="mt-6 text-lg text-[#1f3047]">
        Hôm nay chưa xếp lịch làm việc
      </p>
    </section>
  );
}

function KudosCard() {
  return (
    <section className="flex min-h-52 flex-col items-center justify-center rounded-[10px] border border-[#ebedf2] bg-white p-6 text-center shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
      <div className="mb-5 grid h-14.5 w-26 place-items-center rounded-[14px] bg-[#dc4d79] text-[42px] leading-none text-white shadow-[0_18px_28px_rgba(220,77,121,0.22)]">
        ♥
      </div>
      <strong className="text-2xl text-[#dc4d79]">Tuyệt vời!</strong>
      <span className="mt-1 text-[#647084]">
        Không có cảnh báo cần xử lý trong hôm nay.
      </span>
    </section>
  );
}

export function HomeDashboard() {
  return (
    <main className="overflow-y-auto px-5 py-5 max-[640px]:px-4">
      <DashboardFilter />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 max-[1180px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-5">
          <WorkShiftSummary />
          <TodayStatsGrid />
          <KudosCard />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <SalaryBanner />
          <EmptyScheduleCard />
        </div>
      </div>
    </main>
  );
}
