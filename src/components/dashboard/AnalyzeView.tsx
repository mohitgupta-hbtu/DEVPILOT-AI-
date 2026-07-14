import React, { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useDashboard } from "@/hooks";
import { RepositoryProvider } from "./analysis/RepositoryContext";
import { AnalysisHeader } from "./analysis/AnalysisHeader";
import { EmptyState } from "./analysis/EmptyState";
import { LoadingState } from "./analysis/LoadingState";
import { ErrorState } from "./analysis/ErrorState";
import { AnalysisLayout } from "./analysis/AnalysisLayout";
import { Sidebar } from "./analysis/Sidebar";

export function AnalyzeView() {
  const routerState = useRouterState();
  const { history, activeScan, isScanning, logs, triggerAnalysis, loadScan, scanProgress } =
    useDashboard();

  // Get queries or parameters dynamically
  const searchParams = new URLSearchParams(routerState.location.search || "");
  const queryUrl = searchParams.get("url") || "";
  const queryActiveId = searchParams.get("activeId") || "";

  // Synchronize router url commands if present
  useEffect(() => {
    if (queryUrl) {
      triggerAnalysis(queryUrl);
    } else if (queryActiveId) {
      const match = history.find((s) => s.id === queryActiveId);
      if (match) {
        loadScan(match);
      }
    }
  }, [queryUrl, queryActiveId]);

  const valueContext = {
    activeResult: activeScan,
    isScanning,
    scanProgress,
    logs,
    triggerAnalysis,
    history,
  };

  return (
    <RepositoryProvider value={valueContext}>
      <div className="space-y-8 pb-16">
        <AnalysisHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 space-y-6">
            <EmptyState />
            <LoadingState />
            <ErrorState />
            <AnalysisLayout />
          </div>

          <div className="space-y-6">
            <Sidebar />
          </div>
        </div>
      </div>
    </RepositoryProvider>
  );
}
export default AnalyzeView;
