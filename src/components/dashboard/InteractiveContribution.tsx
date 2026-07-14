import React, { useState } from "react";
import { BookOpen, Terminal, Info, Check, Tag, ExternalLink } from "lucide-react";
import { GoodFirstIssue } from "@/types";

interface InteractiveContributionProps {
  issues: GoodFirstIssue[];
  repoUrl: string;
  repoName: string;
  onNavigateToFile?: (filePath: string) => void;
}

const SETUP_COMMANDS = [
  {
    step: "1. Clone & Branch",
    desc: "Clone the main branch and spin up a feature branch naming it clearly based on task specs.",
    cmd: "git clone <repo_url>\ngit checkout -b feat/your-feature-name",
  },
  {
    step: "2. Install & Start",
    desc: "Pull in the base configuration packages and launch the local sandbox server.",
    cmd: "npm install\nnpm run dev",
  },
  {
    step: "3. Format & Test",
    desc: "Run style rules and verify that none of the core unit specs break prior to commit.",
    cmd: "npm run lint\nnpm run test",
  },
];

export function InteractiveContribution({
  issues,
  repoUrl,
  repoName,
  onNavigateToFile,
}: InteractiveContributionProps) {
  const [activeIssueId, setActiveIssueId] = useState<string | null>(issues[0]?.id || null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCmd = (cmd: string, stepName: string) => {
    navigator.clipboard.writeText(cmd.replace("<repo_url>", repoUrl));
    setCopiedCmd(stepName);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const activeIssue = issues.find((i) => i.id === activeIssueId) || issues[0];

  return (
    <div className="space-y-6">
      {/* 1. BENEFIT SUMMARY */}
      <div className="rounded-xl border border-border bg-card/35 p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-border/30 pb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Project Contribution Blueprint
          </h4>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
          A standardized Contribution Guide decreases onboarding friction by establishing a clear
          development workflow. It guarantees environment determinism across the engineering team,
          enforces strict commit semantics, and isolates{" "}
          <strong className="text-foreground">Good First Issues</strong>
          to provide new contributors with a robust, stress-free path to making their first pull
          request.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-[11px] text-muted-foreground">
          <div className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              <strong>Unified Standard:</strong> Eliminates environment-drift issues.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              <strong>Branch Safety:</strong> Enforces standard lint checks on pipelines.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              <strong>Community Flow:</strong> Empowers builders with structured workflows.
            </span>
          </div>
        </div>
      </div>

      {/* 2. LOCAL SETUP PLAYBOOK */}
      <div className="rounded-xl border border-border bg-card/35 p-6 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Local Architecture Setup</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {SETUP_COMMANDS.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/60 bg-background/30 p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground font-mono">{step.step}</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">{step.desc}</p>
              </div>

              <div className="relative">
                <pre className="rounded bg-background border border-border/40 p-2.5 text-[10px] font-mono text-muted-foreground leading-relaxed break-words overflow-x-auto select-all max-h-[80px]">
                  {step.cmd.replace("<repo_url>", repoUrl)}
                </pre>
                <button
                  onClick={() => handleCopyCmd(step.cmd, step.step)}
                  className="absolute right-1.5 top-1.5 rounded bg-foreground text-background text-[9px] px-2 py-0.5 font-bold hover:opacity-90 transition-all"
                >
                  {copiedCmd === step.step ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Open in VS Code Deep Link */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
          <a
            href={`vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`}
            className="inline-flex items-center gap-2 h-9 rounded-lg bg-[#007ACC] px-4 text-xs font-semibold text-white hover:bg-[#006BB3] transition-colors shadow-md"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.58 2.641l-4.263 3.904L8.254 2.56 2 6.255v11.49l6.254 3.695 5.063-3.986 4.263 3.905L24 17.766V6.234l-6.42-3.593zM8.254 15.22V8.78l5.063 3.22-5.063 3.22zM17.58 17.766l-4.263-3.905v-3.722l4.263 3.905v3.722z" />
            </svg>
            <span>Open in VS Code</span>
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>

      {/* 3. GOOD FIRST ISSUES EXPLORER */}
      <div className="rounded-xl border border-border bg-card/35 p-6 text-left space-y-4">
        <div className="flex items-center border-b border-border/30 pb-3">
          <h3 className="text-sm font-semibold text-foreground">Open "Good First Issues"</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-2">
          {/* Issue Browser Sidebar */}
          <div className="lg:col-span-5 space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {issues.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center border border-dashed border-border rounded-lg">
                No good first issues found in this repository.
              </p>
            ) : (
              issues.map((issue) => {
                const isActive = activeIssueId === issue.id;

                return (
                  <div
                    key={issue.id}
                    className={`rounded-xl border text-left p-4 transition-all cursor-pointer ${
                      isActive
                        ? "bg-card/60 border-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.05)] text-foreground"
                        : "bg-background/20 border-border hover:bg-card/40 text-muted-foreground"
                    }`}
                    onClick={() => setActiveIssueId(issue.id)}
                  >
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-bold text-primary font-mono block">
                          ISSUE #{issue.number}
                        </span>
                        <h4 className="text-xs font-bold leading-tight">{issue.title}</h4>
                      </div>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold font-mono ${
                          issue.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}
                      >
                        {issue.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((l) => (
                        <span
                          key={l}
                          className="rounded bg-background/60 border border-border/50 px-1.5 py-0.5 text-[9px] font-mono opacity-80"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Issue Detail Pane */}
          {activeIssue && (
            <div className="lg:col-span-7 rounded-xl border border-border bg-background p-5 h-full">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-sm font-bold text-foreground truncate">
                  Refactoring Blueprint: #{activeIssue.number}
                </h4>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To securely implement{" "}
                  <strong className="text-foreground">"{activeIssue.title}"</strong>, we recommend
                  executing an isolated feature branch and evaluating entry file hooks. Observe
                  testing specs associated with these boundaries.
                </p>

                <div className="rounded-lg border border-border/60 bg-card/30 p-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono block">
                    Diagnostic Entry Files
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {onNavigateToFile && (
                      <span
                        className="rounded bg-background border border-border px-2 py-1 text-[10px] font-mono text-primary cursor-pointer hover:border-primary/80 transition-colors shadow-sm"
                        onClick={() => onNavigateToFile("src/App.tsx")}
                      >
                        src/App.tsx
                      </span>
                    )}
                    <span className="rounded bg-background border border-border px-2 py-1 text-[10px] font-mono text-muted-foreground cursor-not-allowed">
                      package.json
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono block">
                    Actionable Implementation Steps
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                      <span>
                        Clone the upstream repository and verify local environment installs run
                        cleanly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                      <span>
                        Trace execution path to isolate variables associated with this component
                        anomaly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                      <span>
                        Utilize local unit testing suites before opening a formal pull request
                        upstream.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
