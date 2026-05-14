import { HomeRoleContent } from "../components";
import { useHomeData } from "../services/useHomeData";
import { AppLayout } from "../../../app/layouts";

export function HomePage() {
  const { data, isLoading, error } = useHomeData();

  return (
    <AppLayout>
      {isLoading ? (
        <main className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="rounded-lg border border-[#ebedf2] bg-white px-6 py-4 text-[#667085] shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
            Đang tải dữ liệu trang chủ...
          </div>
        </main>
      ) : error ? (
        <main className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-6 py-4 text-[#b42318]">
            {error}
          </div>
        </main>
      ) : data ? (
        <HomeRoleContent data={data} />
      ) : null}
    </AppLayout>
  );
}
