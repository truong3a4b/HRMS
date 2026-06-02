import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeDollarSign, CalendarOff, PlusCircle, Clock3 } from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { paths } from "../../../app/router/paths";
import { RequestFormModal } from "../components/RequestFormModal";

type CreateRequestKind =
  | "LEAVE"
  | "ATTENDANCE_CORRECTION"
  | "LATE_EARLY"
  | "BONUS_PENALTY";

const requestKinds: Array<{
  key: CreateRequestKind;
  title: string;
  description: string;
  icon: typeof CalendarOff;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  { 
    key: "LEAVE", 
    title: "Đơn xin nghỉ phép", 
    description: "Nghỉ phép năm, nghỉ ốm, thai sản, không lương...",
    icon: CalendarOff,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    key: "ATTENDANCE_CORRECTION",
    title: "Đơn đề xuất cộng công",
    description: "Bổ sung công khi quên chấm công, lỗi thiết bị...",
    icon: PlusCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  { 
    key: "LATE_EARLY", 
    title: "Đơn đi muộn/về sớm", 
    description: "Xin đi làm muộn hoặc về sớm có lý do chính đáng.",
    icon: Clock3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    key: "BONUS_PENALTY",
    title: "Yêu cầu thưởng phạt",
    description: "Đề xuất phiếu thưởng hoặc phạt cho nhân viên theo kỳ lương.",
    icon: BadgeDollarSign,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
];

export function RequestCreatePage() {
  const navigate = useNavigate();
  const [requestKind, setRequestKind] = useState<CreateRequestKind | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (kind: CreateRequestKind) => {
    setRequestKind(kind);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRequestKind(null);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    navigate(paths.requestsMine);
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto bg-[#f4f7fa] flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#243247]">
              Bạn muốn tạo yêu cầu gì?
            </h1>
          </div>

          <div className="grid gap-6 mt-4 w-full max-w-6xl mx-auto md:grid-cols-2">
            {requestKinds.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleOpenModal(item.key)}
                  className="group relative flex-1 flex flex-row items-center gap-5 rounded-2xl border border-[#d0d5dd] bg-white p-5 text-left shadow-[0_4px_20px_rgba(16,24,40,0.05)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(16,24,40,0.08)] active:scale-[0.98]"
                >
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border transition-colors group-hover:scale-110 ${item.bgColor} ${item.color} ${item.borderColor}`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#243247] group-hover:text-[#006fd5] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#667085]">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {requestKind && (
          <RequestFormModal
            open={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
            requestKind={requestKind}
          />
        )}
      </main>
    </AppLayout>
  );
}
