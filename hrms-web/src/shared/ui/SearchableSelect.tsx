import { Select, type SelectProps } from "antd";
import { ChevronDown } from "lucide-react";

export interface SearchableSelectProps extends Omit<SelectProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: React.ReactNode }[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = "",
  ...props
}: SearchableSelectProps) {
  return (
    <Select
      showSearch
      allowClear
      value={value || undefined}
      onChange={onChange}
      placeholder={placeholder}
      optionFilterProp="label"
      filterOption={(input, option) =>
        (option?.label?.toString() ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      suffixIcon={<ChevronDown className="h-4 w-4 text-[#667085]" />}
      className={`h-[38px] w-full [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#d0d5dd] [&_.ant-select-selector]:!shadow-none hover:[&_.ant-select-selector]:!border-[#006fd5] focus-within:[&_.ant-select-selector]:!border-[#006fd5] focus-within:[&_.ant-select-selector]:!ring-2 focus-within:[&_.ant-select-selector]:!ring-[#006fd5]/10 [&_.ant-select-selection-item]:!leading-[36px] ${className}`}
      options={options}
      {...props}
    />
  );
}
