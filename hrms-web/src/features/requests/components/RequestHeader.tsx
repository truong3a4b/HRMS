import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../app/router/paths";

export function RequestHeader({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#243247]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          {description}
        </p>
      </div>
      <button
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006fd5] to-[#0055a8] px-5 py-2.5 text-sm font-semibold text-white! shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] [&_*]:!text-white"
        type="button"
        onClick={() => navigate(paths.requestsCreate)}
      >
        <Plus className="h-4.5 w-4.5" />
        Tạo yêu cầu
      </button>
    </div>
  );
}
