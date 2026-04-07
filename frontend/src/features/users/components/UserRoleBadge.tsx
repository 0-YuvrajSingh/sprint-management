import { Badge } from "../../../components/shared";
import type { UserRole } from "../../../types";

interface UserRoleBadgeProps {
  role: UserRole;
}

const toneByRole: Record<UserRole, "rose" | "indigo" | "green" | "slate"> = {
  ADMIN: "rose",
  MANAGER: "indigo",
  DEVELOPER: "green",
  VIEWER: "slate",
};

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return <Badge tone={toneByRole[role]}>{role}</Badge>;
}
