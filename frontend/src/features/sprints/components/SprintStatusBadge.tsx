import { Badge } from "../../../components/shared";
import type { SprintState } from "../../../data/adminMockData";

interface SprintStatusBadgeProps {
  status: SprintState;
}

const toneByStatus: Record<SprintState, "blue" | "green" | "slate"> = {
  PLANNED: "blue",
  ACTIVE: "green",
  COMPLETED: "slate",
};

export default function SprintStatusBadge({ status }: SprintStatusBadgeProps) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}
