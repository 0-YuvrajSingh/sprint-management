import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, className, containerClassName, id, ...props },
  ref
) {
  return (
    <label className={["flex w-full flex-col gap-1.5", containerClassName ?? ""].join(" ").trim()} htmlFor={id}>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}

      <span
        className={[
          "flex h-11 items-center gap-2 rounded-xl border bg-white px-3 text-sm text-slate-700 transition-colors duration-200",
          error
            ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200"
            : "border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-200",
        ]
          .join(" ")
          .trim()}
      >
        {leadingIcon ? <span className="text-slate-400">{leadingIcon}</span> : null}
        <input
          ref={ref}
          id={id}
          className={[
            "w-full border-none bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400",
            className ?? "",
          ]
            .join(" ")
            .trim()}
          {...props}
        />
      </span>

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
});

export default Input;
