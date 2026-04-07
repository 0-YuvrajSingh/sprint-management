import { Badge } from "../../../components/shared";
import type { ActivityType } from "../../../data/adminMockData";

interface ActivityTypeBadgeProps {
  type: ActivityType;
}

const toneByType: Record<ActivityType, "violet" | "indigo" | "blue" | "green"> = {
  story: "violet",
  project: "indigo",
  sprint: "blue",
  user: "green",
};

export default function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  return <Badge tone={toneByType[type]}>{type}</Badge>;
}
