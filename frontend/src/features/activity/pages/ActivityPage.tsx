import { useState } from "react";
import { ActivitySquare, Search } from "lucide-react";
import { useActivities } from "@/features/activity/hooks/useActivities";
import type { ActivityTargetType } from "@/features/activity/types";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Input } from "@/shared/ui/Input";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { Select } from "@/shared/ui/Select";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const targetOptions: Array<{ label: string; value: "" | ActivityTargetType }> = [
  { label: "All targets", value: "" },
  { label: "Project", value: "PROJECT" },
  { label: "Sprint", value: "SPRINT" },
  { label: "Story", value: "STORY" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Comment", value: "COMMENT" },
];

export function ActivityPage() {
  const [page, setPage] = useState(0);
  const [draftUserEmail, setDraftUserEmail] = useState("");
  const [draftTargetType, setDraftTargetType] = useState<"" | ActivityTargetType>("");
  const [draftTargetId, setDraftTargetId] = useState("");
  const [filters, setFilters] = useState({
    userEmail: "",
    targetType: "" as "" | ActivityTargetType,
    targetId: "",
  });

  const activityQuery = useActivities({
    page,
    size: 12,
    userEmail: filters.userEmail || undefined,
    targetType: filters.targetType || undefined,
    targetId: filters.targetId || undefined,
  });

  const handleApplyFilters = () => {
    setPage(0);
    setFilters({
      userEmail: draftUserEmail.trim(),
      targetType: draftTargetType,
      targetId: draftTargetId.trim(),
    });
  };

  return (
    <PageTransition>
      <PageHeader
        title="Activity"
        description="Review delivery events across projects, sprints, stories, and team assignments."
      />

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <ActivitySquare className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Filter the event stream</p>
            <p className="text-sm text-slate-500">Use email or target filters to narrow the timeline.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_auto]">
          <Input
            label="User email"
            placeholder="name@company.com"
            value={draftUserEmail}
            onChange={(event) => setDraftUserEmail(event.target.value)}
          />
          <Select
            label="Target type"
            value={draftTargetType}
            onChange={(event) => setDraftTargetType(event.target.value as "" | ActivityTargetType)}
          >
            {targetOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            label="Target ID"
            placeholder="Optional entity id"
            value={draftTargetId}
            onChange={(event) => setDraftTargetId(event.target.value)}
          />
          <div className="flex items-end">
            <Button className="w-full lg:w-auto" onClick={handleApplyFilters}>
              <Search className="size-4" />
              Apply filters
            </Button>
          </div>
        </div>
      </Card>

      {activityQuery.isLoading ? <LoadingState /> : null}

      {activityQuery.isError ? (
        <ErrorState
          message={activityQuery.error.message}
          onRetry={() => activityQuery.refetch()}
        />
      ) : null}

      {activityQuery.data ? <ActivityFeed items={activityQuery.data.content} /> : null}

      {activityQuery.data ? (
        <PaginationControls
          page={activityQuery.data.number}
          totalPages={activityQuery.data.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </PageTransition>
  );
}
