import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useRepository } from "./RepositoryContext";
import { OverviewLoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const STAGES = [
  { text: "ESTABLISHING CONNECTIVITY WITH UPSTREAM API GATEWAY" },
  { text: "FETCHING FILE STRUCTURE MANIFEST OVER GITHUB CONTROLLER" },
  { text: "PARSING MANIFEST CONFIGURATIONS AND AST DEPENDENCY NODES" },
  { text: "AUDITING STRUCTURAL CODE SMELLS & LINE COMPLEXITY LIMITS" },
  { text: "CALCULATING COMPILER RULES, LINTER WARNINGS, AND CODE HEALTH" },
  { text: "DISPATCHING GRAPH METADATA MAP TO ACTIVE WORKSPACE" },
];

export function LoadingState() {
  const { isScanning, scanProgress, logs } = useRepository();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isScanning) return null;

  // Derive stage index dynamically based on scan progress percentage
  const currentStageIndex = Math.min(
    Math.floor((scanProgress / 100) * STAGES.length),
    STAGES.length - 1,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-xl border border-border bg-card/35 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
          <Terminal className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-sm font-bold font-mono tracking-tight text-foreground">
            AST_PARSER_DAEMON // REALTIME_ENGINE
          </h3>
        </div>

        {/* Steps/Stages Animations */}
        <div className="space-y-4 mb-6">
          {STAGES.map((stage, idx) => {
            const isDone = currentStageIndex > idx;
            const isActive = currentStageIndex === idx;
            return (
              <div
                key={stage.text}
                className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? "border-primary/40 bg-primary/5 shadow-inner"
                    : isDone
                      ? "border-border/40 bg-muted/20 opacity-60"
                      : "border-transparent opacity-30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full bg-primary animate-ping"
                    style={{ display: isActive ? "block" : "none" }}
                  />
                  <span
                    className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}
                  >
                    {stage.text}
                  </span>
                </div>
                <div className="text-xs font-mono">
                  {isDone ? (
                    <span className="text-primary font-medium">COMPLETE</span>
                  ) : isActive ? (
                    <span className="text-muted-foreground animate-pulse">PROCESSING...</span>
                  ) : (
                    <span className="text-muted-foreground/30">QUEUED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-foreground">SCANNING PROGRESS:</span>
            <span className="text-primary font-bold">{scanProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Log Terminal console */}
        <div className="bg-background border border-border rounded-lg p-4 h-56 overflow-y-auto font-mono text-[10px] text-primary/80 space-y-1.5 scrollbar-thin">
          {logs.map((log, lIdx) => (
            <div key={lIdx} className="leading-relaxed whitespace-pre-wrap text-left">
              {log}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </motion.div>

      {/* Structural layout skeleton preview below terminal to wow the user */}
      <div className="opacity-45 pointer-events-none mt-8 border-t border-border/20 pt-8">
        <OverviewLoadingSkeleton />
      </div>
    </div>
  );
}
export default LoadingState;
