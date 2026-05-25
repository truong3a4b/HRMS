import { AppLayout } from "../../../app/layouts";
import { AppButton } from "../../../shared/ui/AppButton/AppButton";
import { HomeRoleContent } from "../components";
import { useHomeData } from "../services/useHomeData";

export function HomePage() {
  const { data, isLoading, error } = useHomeData();

  return (
    <AppLayout>
      {isLoading ? (
        <main className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
            Đang tải dữ liệu tổng quan...
          </div>
        </main>
      ) : error ? (
        <main className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="max-w-md rounded-lg border border-red-100 bg-white p-5 text-center shadow-sm">
            <h1 className="mb-2 text-lg font-semibold text-slate-900">
              Không thể tải trang tổng quan
            </h1>
            <p className="mb-4 text-sm text-slate-600">{error}</p>
            <AppButton onClick={() => window.location.reload()}>
              Tải lại
            </AppButton>
          </div>
        </main>
      ) : data ? (
        <HomeRoleContent data={data} />
      ) : null}
    </AppLayout>
  );
}
