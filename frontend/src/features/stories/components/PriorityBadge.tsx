import { Badge } from "../../../components/shared";
import type { StoryPriority } from "../../../data/adminMockData";

interface PriorityBadgeProps {
  priority: StoryPriority;
}

const toneByPriority: Record<StoryPriority, "slate" | "amber" | "rose"> = {
  LOW: "slate",
  MEDIUM: "amber",
  HIGH: "rose",
  CRITICAL: "rose",
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <Badge tone={toneByPriority[priority]}>{priority}</Badge>;
}
