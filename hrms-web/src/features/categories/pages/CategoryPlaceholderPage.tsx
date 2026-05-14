import { AppLayout } from "../../../app/layouts";

export function CategoryPlaceholderPage({ title }: { title: string }) {
  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-4 px-5 py-5 max-[640px]:px-4">
          <div>
            <h1 className="text-2xl font-bold text-[#243247]">{title}</h1>
            <p className="text-sm text-[#667085]">
              Chức năng này đang chờ triển khai.
            </p>
          </div>
          <section className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-[#ebedf2] bg-white text-sm text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            Chưa có dữ liệu
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
