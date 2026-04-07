type ActivityKind = "project" | "sprint" | "story" | "user";

interface ActivityItemProps {
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  kind: ActivityKind;
}

const kindClasses: Record<ActivityKind, string> = {
  project: "bg-cyan-100 text-cyan-700",
  sprint: "bg-indigo-100 text-indigo-700",
  story: "bg-amber-100 text-amber-700",
  user: "bg-emerald-100 text-emerald-700",
};

export default function ActivityItem({
  actor,
  action,
  target,
  timestamp,
  kind,
}: ActivityItemProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{actor}</span> {action}{" "}
            <span className="font-semibold text-slate-900">{target}</span>
          </p>
          <p className="text-xs text-slate-500">{timestamp}</p>
        </div>
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
            kindClasses[kind],
          ]
            .join(" ")
            .trim()}
        >
          {kind}
        </span>
      </div>
    </article>
  );
}
