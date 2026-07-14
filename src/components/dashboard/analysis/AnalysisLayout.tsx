import React, { useState } from "react";
import { GitBranch, Star, GitFork, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRepository } from "./RepositoryContext";
import { AnalysisTabs, TabType } from "./AnalysisTabs";
import { OverviewTab } from "./OverviewTab";
import { ArchitectureTab } from "./ArchitectureTab";
import { RoadmapTab } from "./RoadmapTab";
import { HealthTab } from "./HealthTab";
import { ContributionTab } from "./ContributionTab";
import { CodeTreeTab } from "./CodeTreeTab";

export function AnalysisLayout() {
  const { activeResult, triggerAnalysis } = useRepository();
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [repoUrlInput, setRepoUrlInput] = useState("");

  if (!activeResult) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrlInput.trim()) {
      triggerAnalysis(repoUrlInput);
      setRepoUrlInput("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
      {/* Main Repo header stats */}
      <div className="rounded-xl border border-border bg-card/35 p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/25 text-primary shrink-0">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-mono text-lg text-muted-foreground truncate max-w-[140px] sm:max-w-none">
                  {activeResult.owner}/
                </span>
                <span className="font-mono text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                  {activeResult.name}
                </span>
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-semibold font-mono whitespace-nowrap">
                  AST v2
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed truncate sm:whitespace-normal">
                {activeResult.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 justify-between md:justify-end">
            <div className="flex items-center gap-4 bg-background/50 border border-border/80 rounded-lg px-4 py-2 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-primary" />
                {activeResult.stars >= 1000
                  ? `${(activeResult.stars / 1000).toFixed(1)}k`
                  : activeResult.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4 text-muted-foreground" />
                {activeResult.forks >= 1000
                  ? `${(activeResult.forks / 1000).toFixed(1)}k`
                  : activeResult.forks}
              </span>
            </div>
            <div className="text-right border-l border-border/60 pl-5">
              <div className="text-3xl font-bold text-primary font-mono leading-none">
                {activeResult.healthScore}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                Health Score
              </div>
            </div>
          </div>
        </div>

        {/* Language distributions */}
        <div className="mt-6 border-t border-border/40 pt-5">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
            <span>Language Composition</span>
            <span className="font-mono">
              {activeResult.languages.map((l) => `${l.name} (${l.percentage}%)`).join(" // ")}
            </span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted border border-border/45">
            {activeResult.languages.map((lang) => (
              <div
                key={lang.name}
                className="h-full transition-all duration-300"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick analysis change options input */}
      <div className="rounded-xl border border-border/45 bg-card/20 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground font-mono" />
            <input
              type="text"
              placeholder="Paste another repository URL to map..."
              value={repoUrlInput}
              onChange={(e) => setRepoUrlInput(e.target.value)}
              className="h-9 w-full rounded-lg border border-border/60 bg-background/50 pl-9 pr-4 text-xs text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!repoUrlInput.trim()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-mono"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            <span>Map Repo</span>
          </button>
        </form>
      </div>

      {/* Custom Tabs Navigation */}
      <AnalysisTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Render selected active Tab panel */}
      <div className="mt-6">
        {activeTab === "summary" && <OverviewTab />}
        {activeTab === "architecture" && <ArchitectureTab />}
        {activeTab === "roadmap" && <RoadmapTab />}
        {activeTab === "health" && <HealthTab />}
        {activeTab === "contribution" && <ContributionTab />}
        {activeTab === "files" && <CodeTreeTab />}
      </div>
    </motion.div>
  );
}
export default AnalysisLayout;
