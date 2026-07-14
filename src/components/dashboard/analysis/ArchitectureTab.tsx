import React, { useState } from "react";
import { Code, Layers, Folder, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardCard } from "@/components/ui/DashboardCard";

interface InfoDetails {
  title: string;
  desc: string;
  files: string[];
  tips: string[];
}

const ARCHITECTURE_INFOMAP: Record<string, InfoDetails> = {
  entry: {
    title: "System Entrypoint Node",
    desc: "The runtime root of the application. It bootstraps global styles, registers environment providers, and mounts the primary React render tree safely.",
    files: ["src/main.tsx", "index.html", "src/styles.css"],
    tips: [
      "Keep this file clean and free of custom business or feature states.",
      "Ensure unhandled errors or global reject hooks are bound as early as possible.",
    ],
  },
  routing: {
    title: "Application Router",
    desc: "Defines client-side URL path navigation structures, loader states, parameters, and security authentication filters.",
    files: ["src/router.tsx", "src/routes/"],
    tips: [
      "Leverage route-level code splitting and dynamic lazy loads to reduce initial bundle weights.",
      "Consolidate authentication rules inside parent route layout controllers.",
    ],
  },
  layout: {
    title: "Visual Layout Shell",
    desc: "Persistent parent shell layout mapping core navigational frames, sidebars, context notifications, and user metadata banners.",
    files: ["src/routes/__root.tsx", "src/components/layout/"],
    tips: [
      "Prevent layout re-renders by decoupling global action effects from the shell structure.",
      "Utilize absolute overlays for mobile responsive menu drawers.",
    ],
  },
  components: {
    title: "Reusable UI Components",
    desc: "Atomic and pattern components styled using Tailwind. Ensures layout consistency across pages.",
    files: ["src/components/ui/", "src/components/dashboard/"],
    tips: [
      "Keep UI components stateless by delegating updates back up via clear callback events.",
      "Avoid coupling network state directly into shared presentation layers.",
    ],
  },
  hooks: {
    title: "Custom State Hooks",
    desc: "Encapsulates reusable reactive behaviors, side-effects, cache timers, and backend API query wrappers.",
    files: ["src/hooks/", "src/contexts/"],
    tips: [
      "Stabilize dependencies with useCallback/useMemo selectors to completely avoid re-render loops.",
      "Provide fallback values for disconnected local-storage variables.",
    ],
  },
  lib: {
    title: "Core Service Utilities",
    desc: "Low-level API wrappers, database connections, formatting helpers, and complex computational algorithms.",
    files: ["src/lib/", "src/utils/", "src/services/"],
    tips: [
      "Write purely deterministic helpers that can be unit-tested without complex mock states.",
      "Proxy third-party SDK calls server-side to guarantee client key safety.",
    ],
  },
};

export function ArchitectureTab() {
  const [activeNode, setActiveNode] = useState<string>("entry");
  const activeInfo = ARCHITECTURE_INFOMAP[activeNode] || ARCHITECTURE_INFOMAP.entry;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6 md:grid-cols-5"
      role="tabpanel"
      id="tab-panel-architecture"
      aria-labelledby="tab-trigger-architecture"
    >
      {/* Flow Map */}
      <DashboardCard className="md:col-span-3 flex flex-col items-center">
        <div className="text-left w-full border-b border-border/40 pb-3 mb-6">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Interactive Modular Flow Map
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click any block in the architectural stack to view detailed AI annotations and tips.
          </p>
        </div>

        <div className="flex flex-col items-center gap-10 py-6 w-full max-w-md mx-auto">
          {/* Level 1 */}
          <div className="w-full relative">
            <button
              onClick={() => setActiveNode("entry")}
              className={`w-full mx-auto max-w-[220px] block rounded-xl border p-4 text-center transition-all duration-355 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                activeNode === "entry"
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_-3px_rgba(var(--ring),0.25)] ring-1 ring-primary"
                  : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30"
              }`}
              aria-label="System Entrypoint module details"
            >
              <Code
                className={`h-5 w-5 mx-auto mb-2 ${activeNode === "entry" ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="block text-xs font-bold font-mono">Main Node Entry</span>
              <span className="block text-[9px] text-muted-foreground font-mono mt-1">
                src/main.tsx
              </span>
            </button>
            <div className="absolute top-full left-1/2 h-10 w-[1px] bg-border/80 -translate-x-1/2" />
          </div>

          {/* Level 2 */}
          <div className="w-full relative pt-2">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-border/80" />
            <div className="absolute top-0 left-1/4 h-5 w-[1px] bg-border/80" />
            <div className="absolute top-0 right-1/4 h-5 w-[1px] bg-border/80" />

            <div className="grid grid-cols-2 gap-6 w-full">
              <button
                onClick={() => setActiveNode("routing")}
                className={`rounded-xl border p-3.5 text-center transition-all duration-355 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  activeNode === "routing"
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_-3px_rgba(var(--ring),0.25)] ring-1 ring-primary"
                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
                aria-label="Application Router routing structure"
              >
                <Layers
                  className={`h-4 w-4 mx-auto mb-1.5 ${activeNode === "routing" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="block text-xs font-semibold font-mono">App Routing</span>
                <span className="block text-[9px] text-muted-foreground font-mono">
                  src/router.tsx
                </span>
              </button>

              <button
                onClick={() => setActiveNode("layout")}
                className={`rounded-xl border p-3.5 text-center transition-all duration-355 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  activeNode === "layout"
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_-3px_rgba(var(--ring),0.25)] ring-1 ring-primary"
                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
                aria-label="Layout Shell view layers details"
              >
                <Layers
                  className={`h-4 w-4 mx-auto mb-1.5 ${activeNode === "layout" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="block text-xs font-semibold font-mono">Layout Shell</span>
                <span className="block text-[9px] text-muted-foreground font-mono">
                  src/routes/__root
                </span>
              </button>
            </div>
            <div className="absolute top-full left-1/2 h-10 w-[1px] bg-border/80 -translate-x-1/2" />
          </div>

          {/* Level 3 */}
          <div className="w-full relative pt-2">
            <div className="absolute top-0 left-1/6 right-1/6 h-[1px] bg-border/80" />
            <div className="absolute top-0 left-1/6 h-5 w-[1px] bg-border/80" />
            <div className="absolute top-0 left-1/2 h-5 w-[1px] bg-border/80" />
            <div className="absolute top-0 right-1/6 h-5 w-[1px] bg-border/80" />

            <div className="grid grid-cols-3 gap-3 w-full">
              {["components", "hooks", "lib"].map((node) => {
                const label =
                  node === "lib" ? "Lib / Utils" : node === "hooks" ? "Custom Hooks" : "Components";
                return (
                  <button
                    key={node}
                    onClick={() => setActiveNode(node)}
                    className={`rounded-xl border p-2.5 text-center transition-all duration-355 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                      activeNode === node
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(var(--ring),0.25)] ring-1 ring-primary"
                        : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30"
                    }`}
                    aria-label={`Show details for ${label}`}
                  >
                    <Folder
                      className={`h-4 w-4 mx-auto mb-1 ${activeNode === node ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="block text-[10px] font-semibold font-mono truncate">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Details Side Panel */}
      <div className="md:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <DashboardCard className="text-left space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">AI Architectural Annotation</h4>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-primary font-mono uppercase tracking-wider block">
                    {activeInfo.title}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{activeInfo.desc}</p>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                    Key Files Mapping
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeInfo.files.map((f) => (
                      <span
                        key={f}
                        className="rounded bg-background border border-border/60 px-2 py-0.5 font-mono text-[10px] text-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/40 pt-4 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                  Scalability Check & AI Recommendations
                </span>
                <ul className="space-y-1.5">
                  {activeInfo.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-muted-foreground list-disc list-inside"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </DashboardCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
export default ArchitectureTab;
