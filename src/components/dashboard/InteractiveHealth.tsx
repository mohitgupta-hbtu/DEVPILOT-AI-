import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShieldCheck,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { HealthMetrics, HealthRecommendation, HealthExpl } from "@/types";

interface InteractiveHealthProps {
  metrics: HealthMetrics;
  recommendations?: HealthRecommendation[];
  explanations?: HealthExpl;
  repoUrl: string;
  repoName: string;
  overallHealthScore?: number;
  onNavigateToFile?: (filePath: string) => void;
}

export function InteractiveHealth({
  metrics,
  recommendations = [],
  explanations = {},
  repoUrl,
  repoName,
  overallHealthScore,
  onNavigateToFile,
}: InteractiveHealthProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("documentation");
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fallback recommendations if none provided by raw data (e.g. loading past scans from history cache)
  const computedRecommendations = useMemo(() => {
    if (recommendations && recommendations.length > 0) {
      return recommendations;
    }
    const list: HealthRecommendation[] = [];
    if (!metrics) return list;

    if (metrics.documentation <= 85) {
      list.push({
        id: "fall-readme",
        category: "documentation",
        title: "Expand README Project Guidelines",
        description:
          "The documentation score is low. Consider publishing a detailed README layout explaining dependencies, build parameters, and local .env keys.",
        severity: "medium",
        suggestion:
          "# Setup Instructions\n1. Copy environment keys:\n   cp .env.example .env\n2. Boot standard scripts:\n   npm install && npm run dev",
      });
    }

    if (metrics.codeQuality <= 85) {
      list.push({
        id: "fall-eslint",
        category: "quality",
        title: "Integrate Quality Checks (ESLint / Prettier)",
        description:
          "Code syntax metrics are sub-optimal. Integrate ESLint and prettier configurations to enforce standard rulesets dynamically across team updates.",
        severity: "medium",
        suggestion:
          "npm init @eslint/config\n# And generate .prettierrc files:\necho {} > .prettierrc",
      });
    }

    if (metrics.testing <= 80) {
      list.push({
        id: "fall-testing",
        category: "testing",
        title: "Establish Automated Testing Framework",
        description:
          "No codebase testing suites were parsed during this scan. Set up Vitest or Pytest to assert operational stability before publishing compiler modifications.",
        severity: "high",
        suggestion:
          "# Install testing runners:\nnpm install -D vitest\n# run unit checks:\nnpx vitest",
      });
    }

    if (metrics.maintainability <= 85) {
      list.push({
        id: "fall-folders",
        category: "maintainability",
        title: "Partition Files Into Dedicated Subfolders",
        description:
          "Flat or disorganized source files hamper project navigation. Consider allocating code into dedicated structures like `/src/components` and `/src/utils`.",
        severity: "low",
        suggestion: "mkdir src/components src/utils src/hooks src/services",
      });
    }

    return list;
  }, [recommendations, metrics]);

  // Overall combined score is the average of the metrics
  const overallScore = useMemo(() => {
    if (overallHealthScore !== undefined) return overallHealthScore;
    if (!metrics) return 0;
    return Math.round(
      (metrics.documentation +
        metrics.codeQuality +
        metrics.maintainability +
        metrics.complexity +
        metrics.testing) /
        5,
    );
  }, [metrics, overallHealthScore]);

  const getHealthGrade = (score: number) => {
    if (score >= 90)
      return {
        grade: "A",
        color: "text-emerald-500 border-emerald-500/30",
        bg: "bg-emerald-500/10",
        label: "Excellent Health",
        desc: "Minimal structural issues and solid software configurations.",
      };
    if (score >= 75)
      return {
        grade: "B",
        color: "text-blue-500 border-blue-500/30",
        bg: "bg-blue-500/10",
        label: "Healthy Standard",
        desc: "Functional organization with minor cleanups recommended.",
      };
    if (score >= 55)
      return {
        grade: "C",
        color: "text-amber-500 border-amber-500/30",
        bg: "bg-amber-500/10",
        label: "Moderate Risk",
        desc: "A few complex code blocks or low test coverage needing attention.",
      };
    return {
      grade: "D",
      color: "text-rose-500 border-rose-500/30",
      bg: "bg-rose-500/10",
      label: "Technical Debt Alert",
      desc: "Significant nesting depth or low configuration outlines.",
    };
  };

  const currentGradeInfo = getHealthGrade(overallScore);

  // Dynamic overrides using backend-supplied explanations, fallback to standard description if empty
  const checkGroups = {
    documentation: {
      title: "Repository Documentation Details",
      score: metrics?.documentation || 0,
      desc:
        explanations.documentation ||
        "Measures quality of README files, documentation blocks, environment examples, and configuration templates.",
      checkpoints: [
        "Repository includes a README.md outlining main scripts, requirements, and deployment configurations.",
        "A template .env.example or runtime settings guide is accessible to guide setup.",
        "Critical codebase exports use structured documentation or comment annotations.",
      ],
    },
    quality: {
      title: "Code Structure & Linter Quality",
      score: metrics?.codeQuality || 0,
      desc:
        explanations.codeQuality ||
        "Tracks codebase layout uniformity, standard syntax rules compliance, and package dependency cleanups.",
      checkpoints: [
        "Source syntax standards are enforced throughout project file modules.",
        "Code base is clean of orphaned variables or duplicate imports.",
        "Proper build boundaries exist between static view templates and database routes.",
      ],
    },
    maintainability: {
      title: "Codebase Modular Maintainability",
      score: metrics?.maintainability || 0,
      desc:
        explanations.maintainability ||
        "Evaluates standard file size structures, folder nesting complexity, and file partition decoupling parameters.",
      checkpoints: [
        "Logical controllers and utility adapters are decoupled from view presentation pages.",
        "Folder structures stay organized, avoiding excessive nested subdirectory levels.",
        "Duplicate constants, magic strings, and configuration settings are grouped cleanly.",
      ],
    },
    complexity: {
      title: "Logical Complexity & Performance",
      score: metrics?.complexity || 0,
      desc:
        explanations.complexity ||
        "Assesses function length boundaries, cyclomatic statement nesting levels, and cache utilization targets.",
      checkpoints: [
        "Functions feature guard clauses ensuring quick exits and low nested block depth.",
        "Large controller modules or classes are cleanly decomposed into small utilities.",
        "Heavy algorithms or expensive data fetches employ caching routines to speed up runtime loops.",
      ],
    },
    testing: {
      title: "Testing Coverage & Test Suites",
      score: metrics?.testing || 0,
      desc:
        explanations.testing ||
        "Verifies test runner availability (Vitest, pytest, etc.), mock adapters, and functional test coverage scopes.",
      checkpoints: [
        "Unit testing frameworks are configured and run properly against the codebase.",
        "Mock response adapters isolate runtime services from third-party networks during audits.",
        "Critical database operations and business calculations are safeguarded by unit coverages.",
      ],
    },
  };

  const handleCopyClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEALTH SUMMARY SCOREBOARD (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Metric Circular Dial */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card/35 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-3 -mr-3 w-16 h-16 rounded-full bg-primary/5 blur-lg" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-4 block">
            Repository Health Status
          </span>

          <div className="relative flex items-center justify-center h-32 w-32 mb-4">
            <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-muted"
                strokeWidth="7"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-primary"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * overallScore) / 100 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground font-mono leading-none">
                {overallScore}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                Score Rank
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{currentGradeInfo.label}</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {currentGradeInfo.desc}
            </p>
          </div>
        </div>

        {/* Competency grade and qualitative overview */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card/35 p-6 flex flex-col justify-between text-left relative overflow-hidden">
          <div className="absolute right-0 bottom-0 -mb-4 -mr-4 text-primary/5 pointer-events-none">
            <Heart className="h-36 w-36 animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Software Quality Audit
                </h4>
              </div>
              <span
                className={`h-11 w-11 rounded-full border-2 text-xl font-bold font-mono flex items-center justify-center ${currentGradeInfo.color} ${currentGradeInfo.bg}`}
              >
                {currentGradeInfo.grade}
              </span>
            </div>

            <h3 className="text-base font-bold text-foreground">Codebase Diagnostics & Metrics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This score indicates the structural health of the repository. DevPilot AI parses tree
              structures, file sizes, nested layout boundaries, compiler setups, and test suite
              indicators to formulate standard quality recommendations.
            </p>

            <div className="flex flex-col gap-2 rounded-lg bg-background/50 border border-border/80 p-3.5 mt-2">
              <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider block">
                Primary Diagnostics Log
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                {explanations.codeQuality ||
                  "Auditing folder structure. Linters and typescript rules are being enforced dynamically."}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2 border-t border-border/30">
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Scroll down to examine specific compiler/dependency recommendations.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PRIORITY RECOMMENDATIONS */}
      {computedRecommendations.length > 0 && (
        <div className="rounded-xl border border-border bg-card/15 p-6 text-left space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Actionable Priority Recommendations
              </h3>
              <p className="text-xs text-muted-foreground">
                Action items identified by scanning lockfiles, configurations, and directory
                footprints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {computedRecommendations.map((rec) => {
              const isOpen = expandedRecId === rec.id;
              const severityStyles =
                rec.severity === "high"
                  ? { bg: "bg-rose-500/10 border-rose-500/20 text-rose-500", icon: ShieldAlert }
                  : rec.severity === "medium"
                    ? {
                        bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
                        icon: AlertTriangle,
                      }
                    : { bg: "bg-blue-500/10 border-blue-500/20 text-blue-500", icon: Info };

              const IconComponent = severityStyles.icon;

              return (
                <div
                  key={rec.id}
                  className={`rounded-lg border bg-card/40 transition-all hover:bg-muted/10 overflow-hidden flex flex-col justify-between ${
                    isOpen
                      ? "md:col-span-2 border-primary/40 bg-card/65 shadow-sm"
                      : "border-border"
                  }`}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider flex items-center gap-1 ${severityStyles.bg}`}
                        >
                          <IconComponent className="h-3 w-3" />
                          {rec.severity}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                          {rec.category}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedRecId(isOpen ? null : rec.id)}
                        className="text-xs text-primary font-mono hover:underline flex items-center gap-1"
                      >
                        <span>{isOpen ? "Collapse" : "Show Action"}</span>
                        {isOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-foreground">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <AnimatePresence>
                    {isOpen && rec.suggestion && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50 bg-background/45 overflow-hidden"
                      >
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Terminal className="h-3.5 w-3.5 text-primary" />
                              Suggested configuration pattern:
                            </span>
                            <button
                              onClick={() => handleCopyClipboard(rec.suggestion || "", rec.id)}
                              className="hover:text-foreground flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-muted"
                            >
                              {copiedId === rec.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-black/60 text-emerald-400 p-3 rounded font-mono text-[11px] overflow-x-auto border border-border/40 max-h-48 text-left whitespace-pre-wrap select-all">
                            <code>{rec.suggestion}</code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SET ACCORDIONS DETAIL BREAKDOWN */}
      <div className="max-w-4xl mx-auto space-y-4 text-left">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Detailed Metric Breakdowns
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              id: "documentation",
              label: "Documentation Coverage",
              ...checkGroups.documentation,
            },
            {
              id: "quality",
              label: "Code Syntax Quality",
              ...checkGroups.quality,
            },
            {
              id: "maintainability",
              label: "Modular Maintainability",
              ...checkGroups.maintainability,
            },
            {
              id: "complexity",
              label: "Cognitive Complexity Rating",
              ...checkGroups.complexity,
            },
            {
              id: "testing",
              label: "Testing Coverage Ratio",
              ...checkGroups.testing,
            },
          ].map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <div
                key={section.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "bg-card/45 border-primary/50 shadow-[0_0_12px_rgba(var(--color-primary),0.04)]"
                    : "bg-card/35 border-border hover:bg-muted/10"
                }`}
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-1 w-full mr-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-primary shrink-0" />
                        <h4 className="text-xs font-bold text-foreground">{section.label}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                        {section.score}%
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden w-full mt-2">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${section.score}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-background/25 border-t border-border/30"
                    >
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {section.desc}
                        </p>
                        <div className="h-px bg-border/40" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                          Quality Indicators Checkpoints
                        </span>
                        <div className="space-y-2.5">
                          {section.checkpoints.map((checkpoint, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-foreground/90 leading-relaxed font-sans">
                                {checkpoint}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
