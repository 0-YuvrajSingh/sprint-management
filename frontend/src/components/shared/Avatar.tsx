import type { ImgHTMLAttributes } from "react";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return "AT";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export default function Avatar({
  name,
  src,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const classes = [
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-700",
    sizeClasses[size],
    className ?? "",
  ]
    .join(" ")
    .trim();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={classes}
        loading="lazy"
        {...props}
      />
    );
  }

  return <span className={classes}>{toInitials(name)}</span>;
}
