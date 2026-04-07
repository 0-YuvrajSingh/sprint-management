import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

function safeParse(value: string | Date) {
  return value instanceof Date ? value : parseISO(value);
}

export function formatDateTime(value: string | Date) {
  try {
    return format(safeParse(value), "dd MMM yyyy, p");
  } catch {
    return "Unknown";
  }
}

export function formatDateOnly(value: string | Date) {
  try {
    return format(safeParse(value), "dd MMM yyyy");
  } catch {
    return "Unknown";
  }
}

export function formatRelativeDate(value: string | Date) {
  try {
    return formatDistanceToNowStrict(safeParse(value), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getInitials(source: string) {
  const parts = source
    .replace(/[@._-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "AT";
}
