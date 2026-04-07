interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-lg bg-slate-200/70",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite]",
        "before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.8),transparent)]",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      aria-hidden="true"
    />
  );
}
