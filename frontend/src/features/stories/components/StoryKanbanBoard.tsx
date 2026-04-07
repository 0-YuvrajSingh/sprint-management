import { StoryCard } from "@/features/stories/components/StoryCard";
import type { KanbanColumn, Story, StoryStatus } from "@/features/stories/types";
import { cn } from "@/shared/lib/cn";
import type { DragEvent } from "react";
import { useEffect, useState } from "react";

const columnMeta: Record<KanbanColumn, { title: string; description: string }> = {
  TODO: {
    title: "Todo",
    description: "Stories waiting to be picked up.",
  },
  IN_PROGRESS: {
    title: "In progress",
    description: "Active delivery and review-stage work.",
  },
  DONE: {
    title: "Done",
    description: "Completed stories ready to celebrate.",
  },
};

type BoardState = Record<KanbanColumn, Story[]>;

function statusToColumn(status: StoryStatus): KanbanColumn {
  if (status === "DONE") {
    return "DONE";
  }

  if (status === "IN_PROGRESS" || status === "IN_REVIEW") {
    return "IN_PROGRESS";
  }

  return "TODO";
}

function columnToStatus(column: KanbanColumn, currentStatus: StoryStatus): StoryStatus {
  if (column === "DONE") {
    return "DONE";
  }

  if (column === "IN_PROGRESS") {
    return currentStatus === "IN_REVIEW" ? "IN_REVIEW" : "IN_PROGRESS";
  }

  return "TODO";
}

function buildBoard(stories: Story[]): BoardState {
  const sortedStories = [...stories].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  return sortedStories.reduce<BoardState>(
    (board, story) => {
      board[statusToColumn(story.status)].push(story);
      return board;
    },
    {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    },
  );
}

interface StoryKanbanBoardProps {
  stories: Story[];
  onMoveStory: (story: Story, nextStatus: StoryStatus) => void;
  isUpdating: boolean;
}

export function StoryKanbanBoard({ stories, onMoveStory, isUpdating }: StoryKanbanBoardProps) {
  const [board, setBoard] = useState<BoardState>(() => buildBoard(stories));
  const [draggingStory, setDraggingStory] = useState<Story | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);

  useEffect(() => {
    setBoard(buildBoard(stories));
  }, [stories]);

  const handleColumnDragOver = (event: DragEvent<HTMLDivElement>, column: KanbanColumn) => {
    event.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (column: KanbanColumn) => {
    if (!draggingStory) {
      return;
    }

    const sourceColumn = statusToColumn(draggingStory.status);
    const nextStatus = columnToStatus(column, draggingStory.status);

    if (sourceColumn !== column) {
      setBoard((current) => {
        const remainingSourceStories = current[sourceColumn].filter((story) => story.id !== draggingStory.id);
        const movedStory = {
          ...draggingStory,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...current,
          [sourceColumn]: remainingSourceStories,
          [column]: [movedStory, ...current[column]],
        };
      });

      onMoveStory(draggingStory, nextStatus);
    }

    setDraggingStory(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {(Object.keys(columnMeta) as KanbanColumn[]).map((column) => (
        <div
          key={column}
          onDragOver={(event) => handleColumnDragOver(event, column)}
          onDrop={() => handleDrop(column)}
          className={cn(
            "rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-panel transition",
            dragOverColumn === column && "border-brand-300 bg-brand-50/60",
          )}
        >
          <div className="mb-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{columnMeta[column].title}</h2>
                <p className="mt-1 text-sm text-slate-500">{columnMeta[column].description}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {board[column].length}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {board[column].map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isDragging={draggingStory?.id === story.id}
                onDragStart={(nextStory) => setDraggingStory(nextStory)}
                onDragEnd={() => {
                  setDraggingStory(null);
                  setDragOverColumn(null);
                }}
                onDragOver={(event) => handleColumnDragOver(event, column)}
              />
            ))}

            {board[column].length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm text-slate-400">
                Drop a story here
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {isUpdating ? (
        <div className="xl:col-span-3">
          <p className="text-sm text-slate-500">Saving story updates to the backend...</p>
        </div>
      ) : null}
    </div>
  );
}
