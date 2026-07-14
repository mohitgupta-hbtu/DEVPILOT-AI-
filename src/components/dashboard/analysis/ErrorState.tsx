import React from "react";
import { AlertTriangle, RefreshCw, Github, Key } from "lucide-react";
import { useRepository } from "./RepositoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export function ErrorState() {
  const { logs, isScanning, triggerAnalysis, activeResult } = useRepository();
  const { loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  // Pick the last error log if present
  const errorLogs = logs.filter((l) => l.includes("❌") || l.includes("ERROR"));
  const lastError = errorLogs[errorLogs.length - 1] || "AST Parsing Daemon Failed.";

  if (isScanning || activeResult) return null;
  if (logs.length === 0 || !logs.some((l) => l.includes("❌") || l.includes("ERROR"))) return null;

  // Detect GitHub API Rate limit / Auth issues
  const isGitHubRateLimit =
    lastError.toLowerCase().includes("rate limit") ||
    lastError.toLowerCase().includes("github_token") ||
    lastError.toLowerCase().includes("forbidden") ||
    lastError.toLowerCase().includes("unauthorized") ||
    lastError.toLowerCase().includes("403");

  if (isGitHubRateLimit) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <div className="rounded-xl border border-primary/20 bg-card/45 p-8 text-center space-y-6 backdrop-blur-sm shadow-[var(--shadow-glow)]">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/30 animate-pulse">
            <Github className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">GitHub API Rate Limit Reached</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              DevPilot AI has exhausted GitHub's unauthenticated API rate limit (60 requests/hr). To
              run deeper searches immediately, sign in via GitHub to authorize up to 5,000
              requests/hr.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <button
              onClick={loginWithGitHub}
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Github className="h-4 w-4 text-primary-foreground" />
              <span>Connect GitHub Profile</span>
            </button>

            <button
              onClick={() => navigate({ to: "/settings" })}
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-muted border border-border/80 px-5 text-xs font-semibold text-muted-foreground hover:bg-muted/95 transition-all"
            >
              <Key className="h-4 w-4 text-muted-foreground" />
              <span>Use Personal Access Token</span>
            </button>
          </div>

          <div className="pt-4 border-t border-border/40">
            <details className="text-[10px] text-muted-foreground/60 text-left font-mono cursor-pointer select-none">
              <summary className="hover:text-foreground transition-colors font-semibold">
                Show raw telemetry diagnostic logs
              </summary>
              <div className="bg-background/80 border border-border/50 rounded-lg p-3 mt-2 text-[9px] text-rose-400 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {errorLogs.join("\n")}
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-5 backdrop-blur-sm shadow-md">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">Analysis Parsing Failed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            {lastError.replace(/\[.*\]\s*/, "")}
          </p>
        </div>

        {/* Small debug logs preview */}
        <div className="bg-background/80 border border-rose-500/15 rounded-lg p-4 font-mono text-[9px] text-rose-400/90 text-left max-h-32 overflow-y-auto">
          {errorLogs.map((log, idx) => (
            <div key={idx} className="truncate">
              {log}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Scanner</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default ErrorState;
