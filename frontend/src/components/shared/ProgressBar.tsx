interface ProgressBarProps {
  value: number;
  tone?: "indigo" | "green" | "blue";
  className?: string;
}

const toneClasses: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  indigo: "bg-gradient-to-r from-indigo-500 to-violet-500",
  green: "bg-gradient-to-r from-emerald-500 to-teal-500",
  blue: "bg-gradient-to-r from-sky-500 to-indigo-500",
};

export default function ProgressBar({ value, tone = "indigo", className }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={["h-2 w-full rounded-full bg-slate-200", className ?? ""].join(" ").trim()}>
      <div
        className={["h-full rounded-full transition-all duration-300", toneClasses[tone]].join(" ").trim()}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
