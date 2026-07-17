import React from "react";
import { Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useRepository } from "./RepositoryContext";
import { DashboardCard } from "@/components/ui/DashboardCard";

export function OverviewTab() {
  const { activeResult } = useRepository();

  if (!activeResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6 md:grid-cols-3"
      role="tabpanel"
      id="tab-panel-summary"
      aria-labelledby="tab-trigger-summary"
    >
      <div className="md:col-span-2 space-y-6">
        {/* Core AI Objective Block (If present) */}
        {activeResult.metadataAnalysis && (
          <DashboardCard className="text-left border-primary/20 bg-primary/[0.02]">
            <h3 className="text-sm font-semibold tracking-tight text-primary mb-3">
              Repository Core Objective
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                  Purpose
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {activeResult.metadataAnalysis.purpose || "No specific purpose parsed."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                    Primary Audience
                  </span>
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    {activeResult.metadataAnalysis.audience || "General developers"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                    Learning Complexity
                  </span>
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    {activeResult.learningComplexity?.level || "Beginner"}
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Tech Stack with AI Categorizations */}
        <DashboardCard className="text-left">
          <h3 className="text-sm font-semibold tracking-tight text-foreground mb-4">
            Core Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {activeResult.techStackDetails && activeResult.techStackDetails.length > 0
              ? activeResult.techStackDetails.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex flex-col rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-foreground"
                    title={tech.category}
                  >
                    <span className="font-mono font-bold flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {tech.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground opacity-80 uppercase tracking-widest pl-2.5 mt-0.5">
                      {tech.category}
                    </span>
                  </span>
                ))
              : activeResult.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs text-foreground font-mono"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {tech}
                  </span>
                ))}
          </div>
        </DashboardCard>

        {/* Entrypoints */}
        <DashboardCard className="text-left">
          <h3 className="text-sm font-semibold tracking-tight text-foreground mb-4">
            Core Entrypoints
          </h3>
          <div className="space-y-2.5">
            {activeResult.entryPoints.map((entry) => (
              <div
                key={entry}
                className="flex items-center justify-between rounded-lg border border-border/80 bg-background/50 p-3 font-mono text-xs hover:border-primary/35 transition-colors"
              >
                <span className="text-primary font-semibold">{entry}</span>
                <span className="text-[10px] text-muted-foreground">MAIN_AST_NODE</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Onboarding folders */}
        <DashboardCard className="text-left">
          <h3 className="text-sm font-semibold tracking-tight text-foreground mb-4">
            Onboarding Entrypoints
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {activeResult.suggestedStartingFolders.map((folder) => (
              <div
                key={folder}
                className="rounded-lg border border-border/60 bg-background/30 p-4 text-center hover:border-primary/25 transition-all"
              >
                <Folder className="h-5 w-5 text-primary mx-auto mb-2" />
                <span className="block text-xs font-semibold font-mono truncate">{folder}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Right Side: Dependencies */}
      <div className="space-y-6">
        <DashboardCard className="text-left">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dependencies
            </h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">
              {activeResult.dependencies.length} Total
            </span>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin">
            {activeResult.dependencies.map((dep) => (
              <div
                key={dep.name}
                className="flex items-center justify-between rounded-md border border-border/40 bg-background/30 p-2 text-xs"
              >
                <span
                  className="font-mono text-foreground font-medium truncate max-w-[150px]"
                  title={dep.name}
                >
                  {dep.name}
                </span>
                <span className="font-mono text-[10px] text-primary">{dep.version}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
export default OverviewTab;
