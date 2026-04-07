import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import FormHelperText from "./FormHelperText";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  labelAction?: ReactNode;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M1 10C2.4 6.8 5.8 4.5 10 4.5C14.2 4.5 17.6 6.8 19 10C17.6 13.2 14.2 15.5 10 15.5C5.8 15.5 2.4 13.2 1 10Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 3L18 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.1 6.4C7.2 5.5 8.6 5 10 5C14.2 5 17.6 7.3 19 10.5C18.5 11.7 17.8 12.8 16.8 13.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 13C12.2 13.6 11.1 14 10 14C5.8 14 2.4 11.7 1 8.5C1.4 7.6 2 6.8 2.7 6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PasswordInput({
  id,
  label,
  error,
  helperText,
  labelAction,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={[
            "auth-password-input w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 pr-11 text-slate-900 outline-none transition-all duration-200",
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

        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute inset-y-0 right-2.5 inline-flex items-center justify-center text-slate-500 transition-colors duration-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <EyeIcon open={showPassword} />
        </button>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </div>
  );
}
