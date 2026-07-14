import React from "react";
import { RefreshCw } from "lucide-react";
import { useRepository } from "./RepositoryContext";

export function AnalysisHeader() {
  const { activeResult, isScanning, triggerAnalysis } = useRepository();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analyze Repository</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Map files, dependencies, entry points, and generate an interactive onboarding roadmap.
        </p>
      </div>
      {activeResult && !isScanning && (
        <button
          onClick={() => triggerAnalysis(activeResult.repoUrl)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Re-analyze repository"
        >
          <RefreshCw className="h-3.5 w-3.5 text-primary" />
          <span>Re-Analyze</span>
        </button>
      )}
    </div>
  );
}
export default AnalysisHeader;
