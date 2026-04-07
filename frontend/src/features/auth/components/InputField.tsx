import type { InputHTMLAttributes } from "react";
import FormHelperText from "./FormHelperText";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export default function InputField({
  id,
  label,
  error,
  helperText,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        className={[
          "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition-all duration-200",
          "placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-indigo-400",
          className ?? "",
        ]
          .join(" ")
          .trim()}
        {...props}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </div>
  );
}
