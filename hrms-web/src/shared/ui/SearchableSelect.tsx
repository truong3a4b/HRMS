import { Select, type SelectProps } from "antd";
import { ChevronDown } from "lucide-react";

export interface SearchableSelectProps extends Omit<SelectProps, "onChange" | "value"> {
  value?: string | string[] | null;
  onChange?: (value: any, option?: any) => void;
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
      className={`min-h-[38px] w-full [&_.ant-select-selector]:!min-h-[38px] [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#d0d5dd] [&_.ant-select-selector]:!shadow-none hover:[&_.ant-select-selector]:!border-[#006fd5] focus-within:[&_.ant-select-selector]:!border-[#006fd5] focus-within:[&_.ant-select-selector]:!ring-2 focus-within:[&_.ant-select-selector]:!ring-[#006fd5]/10 [&_.ant-select-selection-item]:!leading-[36px] [&_.ant-select-selection-overflow]:!flex [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-placeholder]:!absolute [&_.ant-select-selection-placeholder]:!top-1/2 [&_.ant-select-selection-placeholder]:!-translate-y-1/2 [&_.ant-select-selection-placeholder]:!m-0 [&_.ant-select-selection-placeholder]:!leading-[36px] ${className}`}
      options={options}
      {...props}
    />
  );
}
