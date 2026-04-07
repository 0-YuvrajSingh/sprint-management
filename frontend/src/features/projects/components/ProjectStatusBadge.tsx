import { Badge } from "../../../components/shared";
import type { ProjectStatus } from "../../../data/adminMockData";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const toneByStatus: Record<ProjectStatus, "indigo" | "green" | "amber" | "slate"> = {
  PLANNING: "slate",
  ACTIVE: "indigo",
  PAUSED: "amber",
  COMPLETED: "green",
};

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}
