import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, GitBranch, FileCode2, BookOpen, Activity } from "lucide-react";

const steps = [
  { icon: FileCode2, label: "Scanning 842 files" },
  { icon: GitBranch, label: "Mapping architecture" },
  { icon: BookOpen, label: "Building learning roadmap" },
  { icon: Activity, label: "Checking repo health" },
];

export function RepoPreview() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= steps.length ? 0 : p + 1));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 blur-2xl" />
      <div className="rounded-2xl border border-border bg-card/80 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-chart-4/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5" />
            github.com/vercel/next.js
          </div>
        </div>
        <div className="space-y-3 p-5">
          {steps.map((s, i) => {
            const done = i < progress;
            const active = i === progress;
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5"
              >
                <div className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card">
                  {done ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 text-sm text-foreground">{s.label}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {done ? "done" : active ? "…" : "queued"}
                </div>
              </div>
            );
          })}
          <motion.div
            key={progress}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-lg border border-border/60 bg-background/40 p-4"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Summary</span>
              <span className="font-mono">TypeScript · React · Node</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              A production-grade React framework with hybrid rendering. Core modules live under{" "}
              <span className="font-mono text-primary">packages/next</span>, with a router built on
              file-system conventions and a bundler layer wrapping{" "}
              <span className="font-mono text-primary">turbopack</span>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
