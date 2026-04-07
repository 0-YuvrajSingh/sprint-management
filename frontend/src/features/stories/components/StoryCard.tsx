import { GripVertical, UserRound } from "lucide-react";
import type { DragEvent } from "react";
import type { Story } from "@/features/stories/types";
import { cn } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/ui/StatusBadge";

interface StoryCardProps {
  story: Story;
  isDragging: boolean;
  onDragStart: (story: Story) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
}

export function StoryCard({ story, isDragging, onDragStart, onDragEnd, onDragOver }: StoryCardProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(story)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={cn(
        "group cursor-grab rounded-[24px] border border-white/70 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-panel",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <GripVertical className="size-4 transition group-hover:text-brand-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{story.id.slice(0, 8)}</p>
          </div>
          <h3 className="text-sm font-semibold leading-6 text-ink">{story.title}</h3>
        </div>
        <StatusBadge value={story.priority} />
      </div>

      {story.description ? <p className="mt-3 text-sm leading-6 text-slate-500">{story.description}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {story.status === "IN_REVIEW" ? <StatusBadge value={story.status} /> : null}
        {story.storyPoints ? <StatusBadge value={`${story.storyPoints} pts`} /> : null}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <UserRound className="size-4" />
        <span>{story.assigneeEmail || "Unassigned"}</span>
      </div>
    </div>
  );
}
