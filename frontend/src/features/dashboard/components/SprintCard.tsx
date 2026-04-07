interface SprintCardProps {
  sprintName: string;
  projectName: string;
  dateRange: string;
  progress: number;
  doneCount: number;
  totalCount: number;
  blockers: string[];
}

export default function SprintCard({
  sprintName,
  projectName,
  dateRange,
  progress,
  doneCount,
  totalCount,
  blockers,
}: SprintCardProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <article className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-slate-100 shadow-[0_22px_60px_-34px_rgba(30,64,175,0.75)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/80">Active Sprint</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight">{sprintName}</h3>
          <p className="mt-1 text-sm text-slate-300">{projectName}</p>
        </div>
        <span className="rounded-full border border-indigo-300/40 bg-indigo-300/10 px-3 py-1 text-xs font-semibold text-indigo-100">
          {dateRange}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-300">Completion</span>
          <span className="font-semibold text-indigo-100">{safeProgress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-indigo-200/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300 transition-[width] duration-300"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Delivered</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {doneCount}/{totalCount} Stories
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Blockers</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            {blockers.length > 0 ? (
              blockers.map((blocker) => <li key={blocker}>{blocker}</li>)
            ) : (
              <li>No active blockers</li>
            )}
          </ul>
        </div>
      </div>
    </article>
  );
}
