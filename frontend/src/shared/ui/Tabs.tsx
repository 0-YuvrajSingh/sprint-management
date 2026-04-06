import { cn } from "@/shared/lib/cn";

export interface TabOption {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-2xl border border-white/70 bg-white/85 p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "rounded-2xl px-4 py-2 text-sm font-semibold transition",
            activeTab === tab.value ? "bg-ink text-white shadow-soft" : "text-slate-500 hover:text-slate-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
