import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";

type AttendanceMonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AttendanceMonthPicker({
  value,
  onChange,
}: AttendanceMonthPickerProps) {
  return (
    <DatePicker
      picker="month"
      className="bg-gradient-to-r from-blue-100 via-white to-blue-100 border border-blue-300 rounded-xl hover:border-blue-400 transition-all duration-300 px-4 py-2 font-bold text-slate-800"
      value={dayjs(value, "YYYY-MM")}
      format="MM/YYYY"
      allowClear={false}
      onChange={(date: Dayjs | null) => {
        if (date) onChange(date.format("YYYY-MM"));
      }}
    />
  );
}
