import type { SelectHTMLAttributes } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: DropdownOption[];
  label?: string;
  containerClassName?: string;
}

export default function Dropdown({
  options,
  label,
  containerClassName,
  className,
  id,
  ...props
}: DropdownProps) {
  return (
    <label className={["flex min-w-[10rem] flex-col gap-1.5", containerClassName ?? ""].join(" ").trim()} htmlFor={id}>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <span className="relative">
        <select
          id={id}
          className={[
            "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition-colors duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200",
            className ?? "",
          ]
            .join(" ")
            .trim()}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </label>
  );
}
