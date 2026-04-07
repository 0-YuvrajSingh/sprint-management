import { MessageSquareText, PencilLine, Plus, Trash2, UserRoundCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityEntry } from "@/features/activity/types";
import { formatEnumLabel, formatRelativeDate } from "@/shared/lib/format";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

const iconMap: Record<ActivityEntry["actionType"], LucideIcon> = {
  CREATED: Plus,
  UPDATED: PencilLine,
  DELETED: Trash2,
  STATUS_CHANGED: Workflow,
  ASSIGNED: UserRoundCheck,
  COMMENTED: MessageSquareText,
};

interface ActivityFeedProps {
  items: ActivityEntry[];
  compact?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ActivityFeed({
  items,
  compact = false,
  emptyTitle = "No activity yet",
  emptyDescription = "Activity will appear here as teams create, update, and move work through AgileTrack.",
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <Card className={compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = iconMap[item.actionType];

          return (
            <div key={item.id} className="flex items-start gap-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
              <div className="rounded-2xl bg-white p-3 text-brand-700 shadow-sm">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink">{item.description || formatEnumLabel(item.actionType)}</p>
                    <p className="text-xs text-slate-500">
                      {item.userEmail} • {formatRelativeDate(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.actionType} />
                    <StatusBadge value={item.targetType} />
                  </div>
                </div>
                {!compact ? (
                  <p className="text-xs text-slate-500">
                    Target reference: <span className="font-medium text-slate-700">{item.targetId}</span>
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
