import type { Project } from "@/features/projects/types";
import type { Sprint } from "@/features/sprints/types";
import { formatDateOnly } from "@/shared/lib/format";
import { Card } from "@/shared/ui/Card";
import { StatusBadge } from "@/shared/ui/StatusBadge";

interface SprintListProps {
  sprints: Sprint[];
  projects: Project[];
}

export function SprintList({ sprints, projects }: SprintListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sprints.map((sprint) => {
        const projectName = projects.find((project) => project.id === sprint.projectId)?.name ?? "Unknown project";

        return (
          <Card key={sprint.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-display text-2xl font-bold text-ink">{sprint.name}</p>
                <p className="text-sm text-slate-500">{projectName}</p>
              </div>
              <StatusBadge value={sprint.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Start</p>
                <p className="mt-2 text-sm font-semibold text-ink">{formatDateOnly(sprint.startDate)}</p>
              </div>
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">End</p>
                <p className="mt-2 text-sm font-semibold text-ink">{formatDateOnly(sprint.endDate)}</p>
              </div>
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Velocity</p>
                <p className="mt-2 text-sm font-semibold text-ink">{sprint.velocity}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
