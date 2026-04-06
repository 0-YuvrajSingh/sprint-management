export function LoadingState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-white/70 bg-white/80">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-400 border-r-transparent" />
        Loading AgileTrack data...
      </div>
    </div>
  );
}
