import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Sparkles, ShieldAlert, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRepository } from "./RepositoryContext";

const PRESET_EXAMPLES = [
  { label: "React", url: "https://github.com/facebook/react" },
  { label: "Vue", url: "https://github.com/vuejs/core" },
  { label: "FastAPI", url: "https://github.com/fastapi/fastapi" },
  { label: "Zod", url: "https://github.com/colinhacks/zod" },
];

export function EmptyState() {
  const navigate = useNavigate();
  const { isScanning, activeResult, triggerAnalysis, logs } = useRepository();

  const [repoUrl, setRepoUrl] = useState("");

  // Dynamically count scans to trigger API advice block
  const scanCount = typeof window !== "undefined" ? Number(localStorage.getItem("devpilot_scan_count") || "0") : 0;
  const isLimitReached = typeof window !== "undefined" ? (scanCount >= 2 && !localStorage.getItem("sandbox_settings")) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAnalysis(repoUrl);
  };

  const selectPreset = (url: string) => {
    setRepoUrl(url);
  };

  if (isScanning || activeResult) return null;
  // If there's an error block active, hide empty state
  if (logs.some((l) => l.includes("❌") || l.includes("ERROR"))) return null;

  return (
    <div className="grid gap-6 max-w-3xl mx-auto pt-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/30 p-8 shadow-md backdrop-blur-sm text-left"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              GitHub Repository URL
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="https://github.com/facebook/react"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="h-12 w-full rounded-lg border border-border/70 bg-background/50 pl-12 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <span className="text-xs text-muted-foreground font-medium">Examples:</span>
              {PRESET_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => selectPreset(ex.url)}
                  className="rounded-full bg-muted/60 border border-border/60 px-3 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {isLimitReached && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3 text-xs text-foreground/90 text-left">
              <ShieldAlert className="h-4.5 w-4.5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-yellow-500">
                  Free Scan Limit Reached (Promo Active)
                </span>
                <span className="text-muted-foreground block leading-relaxed">
                  You've exhausted your free tier scanning quota. Please configure your custom
                  Google Gemini or OpenRouter API Key in the Settings page to analyze more
                  codebases.
                </span>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/settings" })}
                  className="mt-2 text-primary font-bold hover:underline inline-flex items-center gap-1 font-mono"
                >
                  Go to Settings to add key <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!repoUrl.trim()}
            className="w-full inline-flex h-11 items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
            <span>Launch Deep Architecture Scan</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
export default EmptyState;
