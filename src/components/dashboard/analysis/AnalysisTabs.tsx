import React, { KeyboardEvent } from "react";
import { Layers, Map, BookOpen, HeartPulse, Activity, FolderTree, LucideIcon } from "lucide-react";

export type TabType = "summary" | "architecture" | "roadmap" | "health" | "contribution" | "files";

interface TabItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: "summary", label: "Overview", icon: Layers },
  { id: "architecture", label: "Architecture Flow", icon: Map },
  { id: "roadmap", label: "Learning Roadmap", icon: BookOpen },
  { id: "health", label: "Health Breakdown", icon: HeartPulse },
  { id: "contribution", label: "Contribution Guide", icon: Activity },
  { id: "files", label: "Code Tree", icon: FolderTree },
];

interface AnalysisTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AnalysisTabs({ activeTab, onTabChange }: AnalysisTabsProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const targetTab = TABS[nextIndex];
    onTabChange(targetTab.id);

    // Dynamic focus management supporting WAI-ARIA rules
    setTimeout(() => {
      const button = document.getElementById(`tab-trigger-${targetTab.id}`);
      button?.focus();
    }, 10);
  };

  return (
    <div
      className="flex overflow-x-auto border-b border-border/50 pb-px gap-1.5 scrollbar-none"
      role="tablist"
      aria-label="Repository analysis metrics"
    >
      {TABS.map((t, idx) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            id={`tab-trigger-${t.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-panel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(t.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex h-10 shrink-0 items-center gap-2.5 rounded-t-lg px-4 text-xs font-medium border-b-2 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isActive
                ? "border-primary text-primary bg-primary/5 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`}
            />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
export default AnalysisTabs;
