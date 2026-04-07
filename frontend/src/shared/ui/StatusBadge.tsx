import { formatEnumLabel } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";

interface StatusBadgeProps {
  value: string;
}

function resolveVariant(value: string) {
  const normalized = value.toUpperCase();

  if (["DONE", "COMPLETED", "SUCCESS"].includes(normalized)) {
    return "success";
  }

  if (["ACTIVE", "IN_PROGRESS", "ON_TRACK"].includes(normalized)) {
    return "brand";
  }

  if (["IN_REVIEW", "MANAGER", "MEDIUM"].includes(normalized)) {
    return "accent";
  }

  if (["HIGH", "WARNING", "PLANNED"].includes(normalized)) {
    return "warning";
  }

  if (["AT_RISK", "CANCELLED", "CRITICAL", "ADMIN", "DELETED"].includes(normalized)) {
    return "danger";
  }

  return "neutral";
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return <Badge variant={resolveVariant(value)}>{formatEnumLabel(value)}</Badge>;
}
