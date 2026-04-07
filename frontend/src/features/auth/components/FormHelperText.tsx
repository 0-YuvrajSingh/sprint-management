interface FormHelperTextProps {
  children: string;
  className?: string;
}

export default function FormHelperText({ children, className }: FormHelperTextProps) {
  return <p className={["text-xs text-slate-500", className ?? ""].join(" ").trim()}>{children}</p>;
}
