import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
  Terminal,
  Copy,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  BookOpenCheck,
  Check,
  HelpCircle,
  Lightbulb,
  FileCode,
  Flame,
  Layout,
  Trophy,
} from "lucide-react";
import { RoadmapItem } from "@/types";

interface InteractiveRoadmapProps {
  roadmap: RoadmapItem[];
  repoUrl: string;
  repoName: string;
  onNavigateToFile?: (filePath: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

// Generate rich diagnostic questions based on the phase title
function getQuizQuestionsForPhase(phaseTitle: string, repoName: string): QuizQuestion[] {
  const title = (phaseTitle || "").toLowerCase();
  if (
    title.includes("setup") ||
    title.includes("config") ||
    title.includes("init") ||
    title.includes("bootstrap")
  ) {
    return [
      {
        question: `What is the primary objective of Phase 1 in bootstrapping ${repoName}?`,
        options: [
          "To finalize UI animations and hover states",
          "To establish correct runtime packages, configure env files, and ensure local compiler parameters match development criteria",
          "To deploy production databases and buy domain configurations",
        ],
        correctIdx: 1,
        explanation:
          "Configuring environment dependencies and establishing standard compiler options protects downstream builds from target mismatches.",
      },
      {
        question: "Why should we avoid committing secret keys directly into codebase files?",
        options: [
          "Because package loaders will crash upon reading plaintext tokens",
          "Secrets committed to source code risk leaks and unauthorized access; they should be loaded via .env environments",
          "Git will automatically rewrite the commit to prevent push operations",
        ],
        correctIdx: 1,
        explanation:
          "Keeping sensitive API keys in the environment ensures clear separation of code from configuration variables.",
      },
      {
        question:
          "Which of the following is typically a key file for local environment bootstrapping?",
        options: ["dist/index.html", ".env.example or package.json", "README.md only"],
        correctIdx: 1,
        explanation:
          ".env.example maps out required local environment keys, and package.json provides the dependencies manifest.",
      },
    ];
  } else if (
    title.includes("architecture") ||
    title.includes("module") ||
    title.includes("structure") ||
    title.includes("layout")
  ) {
    return [
      {
        question: `How are dependencies structured and imported in modern modules of ${repoName}?`,
        options: [
          "Using relative file pathways with explicit node modules fallback paths",
          "Using custom workspace directory mapping and clean relative path declarations",
          "Importing raw binary files directly at run-time execution",
        ],
        correctIdx: 1,
        explanation:
          "Clear workspace path declarations simplify import paths and decouple components from deeply nested directory hierarchies.",
      },
      {
        question: "What is the primary benefit of modular architectural patterns?",
        options: [
          "They compile faster to binary code representation",
          "They enable isolated development, simplify testing boundaries, and enhance reusability of functional logic",
          "They require no documentation or inline type hints",
        ],
        correctIdx: 1,
        explanation:
          "By isolating domain logic into dedicated modules, teams can refactor and scale features without causing silent ripple failures.",
      },
      {
        question: "Which component is responsible for orchestrating global layout shells?",
        options: [
          "Leaf components inside ui/",
          "A root layout controller or navigation layout container wrapper",
          "The main stylesheet builder",
        ],
        correctIdx: 1,
        explanation:
          "Layout shell controllers hold shared states (such as navigation sidebar states and user contexts) that remain active across route transitions.",
      },
    ];
  } else if (
    title.includes("routing") ||
    title.includes("pages") ||
    title.includes("navigation") ||
    title.includes("view")
  ) {
    return [
      {
        question: "What is the primary role of a client-side routing controller?",
        options: [
          "To directly pull query logs from backend production servers",
          "To coordinate active URL pathways with corresponding component layout trees, managing loaders and transition states",
          "To convert JSX elements into static HTML sheets on the serverless cluster",
        ],
        correctIdx: 1,
        explanation:
          "Client routers manage client-side state transitions, block unauthorized sub-paths, and trigger route loaders without full page refreshes.",
      },
      {
        question: "Why do we use route-level loaders?",
        options: [
          "To ensure style declarations load before fonts",
          "To retrieve required route parameters and model structures prior to displaying the target view, reducing flicker",
          "To compile the source code on demand inside the user browser",
        ],
        correctIdx: 1,
        explanation:
          "Loaders pre-fetch required data, guaranteeing that the target view renders with populated values, providing a smoother experience.",
      },
      {
        question: "What does code-splitting with dynamic lazy loading accomplish?",
        options: [
          "It forces the browser to load all pages concurrently",
          "It minimizes initial bundle payload sizes by loading route-specific files only when requested by the visitor",
          "It encrypts the client-side JavaScript bundle",
        ],
        correctIdx: 1,
        explanation:
          "Lazy-loading breaks the client build into small chunk files, speeding up first-contentful-paint (FCP) times considerably.",
      },
    ];
  } else if (
    title.includes("data") ||
    title.includes("state") ||
    title.includes("api") ||
    title.includes("backend") ||
    title.includes("database")
  ) {
    return [
      {
        question: "Why should API request keys remain hidden behind server proxies?",
        options: [
          "Because browsers cannot transmit authorization headers",
          "To prevent sensitive credentials from leaking to public inspectable dev consoles or client network trackers",
          "To speed up execution metrics on load balancers",
        ],
        correctIdx: 1,
        explanation:
          "Exposing third-party API keys (e.g. Gemini, OpenAI, Stripe) in browser requests allows anyone to extract and abuse your keys.",
      },
      {
        question: "What is the purpose of React's dependency arrays in hooks like useEffect?",
        options: [
          "To list all variables that should be deleted on clean-up cycles",
          "To let the framework know exactly when to execute the side-effect based on stable value changes",
          "To set initial layout spacing values",
        ],
        correctIdx: 1,
        explanation:
          "Failing to pass a dependency array or using non-memoized objects causes hooks to execute on every single render, often triggering infinite loops.",
      },
      {
        question: "How do full-stack applications bridge client actions to database targets?",
        options: [
          "By letting client browsers query SQL tables directly",
          "Through secure API route endpoints handling parameters, validation, sanitization, and executing database queries",
          "By storing the whole database inside local-storage parameters",
        ],
        correctIdx: 1,
        explanation:
          "API gateways act as secure brokers that validate client claims before persisting updates to central SQL databases.",
      },
    ];
  } else {
    return [
      {
        question: `What is the main goal when mastering the steps of this phase?`,
        options: [
          "To follow best practices, understand file flow mappings, and execute step-by-step tasks systematically",
          "To quickly copy-paste code snippets without verifying correctness",
          "To delete the configuration files and start from scratch",
        ],
        correctIdx: 0,
        explanation:
          "Strategic step-by-step review allows you to build solid mental models of the repository before committing complex edits.",
      },
      {
        question: "Which tactic best helps in understanding complex open-source projects?",
        options: [
          "Reviewing high-level modular flows, examining entry files, and using stateful checkpoints as guide rails",
          "Reading all lines of code alphabetically by file name",
          "Disabling all safety linters to bypass static checking",
        ],
        correctIdx: 0,
        explanation:
          "Top-down architectural mapping combined with targeted code exploration is widely considered the fastest way to master new codebases.",
      },
      {
        question:
          "What is the recommended attitude towards technical recommendations or checklists?",
        options: [
          "Treat them as interactive markers to systematically verify and track your team progress",
          "Ignore them unless a build compilation failure occurs",
          "Translate everything to external systems manually",
        ],
        correctIdx: 0,
        explanation:
          "Interactive checksheets increase review efficiency and ensure all key development requirements are satisfied.",
      },
    ];
  }
}

// Generate contextual commands based on phase name and titles
function getSuggestedCommandsForPhase(phaseTitle: string): { cmd: string; desc: string }[] {
  const title = (phaseTitle || "").toLowerCase();
  if (
    title.includes("setup") ||
    title.includes("config") ||
    title.includes("init") ||
    title.includes("bootstrap")
  ) {
    return [
      { cmd: "npm install", desc: "Install project dependencies" },
      { cmd: "cp .env.example .env", desc: "Initialize local environment variables file" },
      { cmd: "npm run dev", desc: "Boot up the local development server" },
    ];
  } else if (
    title.includes("test") ||
    title.includes("health") ||
    title.includes("verify") ||
    title.includes("lint")
  ) {
    return [
      { cmd: "npm run lint", desc: "Verify project style conformity and static checks" },
      { cmd: "npm run test", desc: "Execute target suite of test specs" },
      { cmd: "npm run build", desc: "Perform a production build compilation" },
    ];
  } else {
    return [
      { cmd: "git status", desc: "Check active file modifications and repository diffs" },
      { cmd: "npm run build", desc: "Verify build correctness of current workspace layout" },
    ];
  }
}

// Helper to scrape/extract file-looking strings from text
function extractFilePaths(text: string): string[] {
  const fileRegex = /(?:[a-zA-Z0-9_-]+\.[a-zA-Z0-9]{2,4})|(?:src\/[a-zA-Z0-9_/-]+)/g;
  const matches = text.match(fileRegex) || [];
  return Array.from(new Set(matches)).filter((m) => {
    const clean = m.trim();
    if (clean.startsWith("http") || clean.includes("://")) return false;
    if (clean.match(/^\d+\.\d+/)) return false; // exclude versions like "12.0"
    if (clean.match(/^[0-9]+$/)) return false;
    if (clean.endsWith(".") || clean.startsWith(".")) {
      if (clean !== ".env" && clean !== ".env.example" && clean !== ".gitignore") return false;
    }
    return true;
  });
}

export function InteractiveRoadmap({
  roadmap,
  repoUrl,
  repoName,
  onNavigateToFile,
}: InteractiveRoadmapProps) {
  const localStorageKey = `devpilot_roadmap_items_${repoUrl}`;

  // State to store checked checklist items
  // Key format: "phaseId_itemIndex"
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activePhaseId, setActivePhaseId] = useState<string>(roadmap?.[0]?.id || "1");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Persist completed items
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(completedItems));
  }, [completedItems, localStorageKey]);

  // Reset quiz state when switching phases
  useEffect(() => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
  }, [activePhaseId]);

  // If roadmap is empty, show empty state
  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-8 text-center space-y-3">
        <BookOpen className="h-10 w-10 text-muted-foreground/60 mx-auto" />
        <h3 className="text-sm font-semibold text-foreground">No Onboarding Roadmap Available</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          We couldn't generate a structured learning path for this repository structure.
        </p>
      </div>
    );
  }

  const activePhase = roadmap.find((p) => p.id === activePhaseId) || roadmap[0];

  // Calculate total checklists counts
  let totalItemsCount = 0;
  let completedItemsCount = 0;

  roadmap.forEach((phase) => {
    phase.items.forEach((_, idx) => {
      totalItemsCount++;
      if (completedItems[`${phase.id}_${idx}`]) {
        completedItemsCount++;
      }
    });
  });

  const overallProgressPercent =
    totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  // Toggle item completion
  const handleToggleItem = (phaseId: string, itemIdx: number) => {
    const key = `${phaseId}_${itemIdx}`;
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Mark whole phase as complete
  const handleMarkPhaseComplete = (phase: RoadmapItem) => {
    const updates: Record<string, boolean> = {};
    phase.items.forEach((_, idx) => {
      updates[`${phase.id}_${idx}`] = true;
    });
    setCompletedItems((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Reset all progress
  const handleResetProgress = () => {
    if (
      confirm("Are you sure you want to reset all checked checklist items and learning progress?")
    ) {
      setCompletedItems({});
    }
  };

  // Copy command helper
  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Get quiz questions for currently active phase
  const quizQuestions = getQuizQuestionsForPhase(activePhase.title, repoName);
  const currentQuestion = quizQuestions[currentQuizIndex];

  const handleSelectAnswer = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || quizSubmitted) return;
    setQuizSubmitted(true);
    if (selectedAnswer === currentQuestion.correctIdx) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
  };

  // Get custom commands for the active phase
  const suggestedCommands = getSuggestedCommandsForPhase(activePhase.title);

  // Scrape files from current phase description and checklist items
  const scannedFiles = Array.from(
    new Set([
      ...extractFilePaths(activePhase.description),
      ...activePhase.items.flatMap((item) => extractFilePaths(item)),
    ]),
  ).slice(0, 5); // Limit to top 5 files to keep neat

  return (
    <div className="space-y-6">
      {/* 1. TOP PROGRESS BOARD (Bento style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-border/80 bg-card/35 p-5 flex flex-col justify-between text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Interactive Learning Mastership
              </h4>
            </div>
            <h3 className="text-lg font-bold text-foreground">{repoName} Onboarding Journey</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Track your onboarding checkmarks across all core files. Answer dynamic interactive
              diagnostic questions to verify your engineering comprehension.
            </p>
          </div>

          <div className="mt-5 space-y-2 z-10">
            <div className="flex justify-between items-end text-xs">
              <span className="font-medium text-muted-foreground">
                Overall Checklist Completion
              </span>
              <span className="font-mono font-bold text-foreground">
                {completedItemsCount} / {totalItemsCount} Tasks ({overallProgressPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/40">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-glow"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Small Trophy Bento Widget */}
        <div className="rounded-xl border border-border/80 bg-card/35 p-5 flex flex-col justify-between items-start text-left relative overflow-hidden">
          <div className="absolute right-0 bottom-0 -mb-2 -mr-2 text-primary/10 select-none pointer-events-none">
            <Trophy className="h-28 w-28" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
              Developer Tier
            </span>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
              <h4 className="text-base font-bold text-foreground">
                {overallProgressPercent === 100
                  ? "Architect Master"
                  : overallProgressPercent >= 60
                    ? "Proficient Integrationist"
                    : overallProgressPercent >= 20
                      ? "Active Navigator"
                      : "Onboarding Novice"}
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              {overallProgressPercent === 100
                ? "Incredible job! You have fully verified every architectural item and onboarding task."
                : `Complete ${Math.max(1, Math.ceil(totalItemsCount * 0.6) - completedItemsCount)} more tasks to reach the next competency tier.`}
            </p>
          </div>

          <button
            onClick={handleResetProgress}
            className="mt-4 text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 font-mono transition-colors border border-border/60 hover:border-destructive/30 px-2 py-1 rounded bg-background/50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Progress
          </button>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT: LEFT SIDEBAR PHASES, RIGHT DETAILED INTERACTIVE ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Phase Stack (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
            Learning Stages
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {roadmap.map((phase, idx) => {
              const isActive = activePhaseId === phase.id;

              // Calculate completion of this specific phase
              let phaseTotal = 0;
              let phaseDone = 0;
              phase.items.forEach((_, itemIdx) => {
                phaseTotal++;
                if (completedItems[`${phase.id}_${itemIdx}`]) {
                  phaseDone++;
                }
              });
              const phasePercent = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhaseId(phase.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-200 relative overflow-hidden flex flex-col gap-2.5 ${
                    isActive
                      ? "bg-primary/5 border-primary shadow-[0_0_12px_rgba(var(--color-primary),0.06)]"
                      : "bg-card/45 border-border hover:bg-muted/30"
                  }`}
                >
                  {/* Active Indicator Strip */}
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}

                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider block">
                        STAGE 0{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-foreground leading-tight">
                        {phase.title}
                      </h4>
                    </div>
                    {phasePercent === 100 ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5">
                        {phaseDone}/{phaseTotal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {phase.estimatedTime}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] ${
                        phase.difficulty === "Beginner"
                          ? "bg-emerald-500/10 text-emerald-500 font-semibold"
                          : phase.difficulty === "Intermediate"
                            ? "bg-amber-500/10 text-amber-500 font-semibold"
                            : "bg-rose-500/10 text-rose-500 font-semibold"
                      }`}
                    >
                      {phase.difficulty}
                    </span>
                  </div>

                  {/* Micro Progress Line */}
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        phasePercent === 100 ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${phasePercent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Actions Board (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Phase Card */}
          <div className="rounded-xl border border-border bg-card/35 p-6 text-left space-y-6">
            {/* Phase Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] text-primary font-bold font-mono">
                    {activePhase.phase}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground font-mono">
                    Time budget: {activePhase.estimatedTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{activePhase.title}</h3>
              </div>

              <button
                onClick={() => handleMarkPhaseComplete(activePhase)}
                className="shrink-0 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Mark Stage Complete</span>
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>AI Guidance Overview</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed bg-background/20 p-3 rounded-lg border border-border/40">
                {activePhase.description}
              </p>
            </div>

            {/* Interactive Tasks Checklist */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Stage Checkpoints
              </div>
              <div className="space-y-2.5">
                {activePhase.items.map((item, idx) => {
                  const isChecked = !!completedItems[`${activePhase.id}_${idx}`];
                  const detectedFiles = extractFilePaths(item);

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-2 p-3.5 rounded-lg border transition-all duration-200 ${
                        isChecked
                          ? "bg-emerald-500/[0.02] border-emerald-500/20"
                          : "bg-background/40 border-border/60 hover:border-border"
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(activePhase.id, idx)}
                          className="mt-0.5 rounded border-border text-primary focus:ring-primary/40 focus:ring-1 cursor-pointer shrink-0"
                        />
                        <span
                          className={`text-xs leading-relaxed transition-all ${
                            isChecked
                              ? "text-muted-foreground line-through opacity-75"
                              : "text-foreground"
                          }`}
                        >
                          {item}
                        </span>
                      </label>

                      {/* Display direct path inspectors if files are detected in this instruction */}
                      {detectedFiles.length > 0 && onNavigateToFile && (
                        <div className="flex flex-wrap gap-1.5 pl-7 mt-1 border-t border-border/20 pt-2">
                          <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1 mr-1">
                            <FileCode className="h-2.5 w-2.5" />
                            Mentioned files:
                          </span>
                          {detectedFiles.map((file, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => onNavigateToFile(file)}
                              className="inline-flex items-center gap-1 rounded bg-muted/60 border border-border/80 px-2 py-0.5 font-mono text-[9px] text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all"
                              title={`Jump directly to ${file} file content`}
                            >
                              <span>{file}</span>
                              <ExternalLink className="h-2 w-2 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Commands Sandbox (Conditional based on commands available) */}
            {suggestedCommands.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span>Interactive Terminal Playbox</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedCommands.map((command, cIdx) => (
                    <div
                      key={cIdx}
                      className="rounded-lg border border-border/50 bg-background/50 p-3 text-left flex flex-col justify-between gap-2 group hover:border-border transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-foreground bg-card px-2 py-1 rounded border border-border/40 flex items-center justify-between">
                          <span className="truncate">{command.cmd}</span>
                          <button
                            onClick={() => handleCopyCommand(command.cmd, cIdx)}
                            className="text-muted-foreground hover:text-foreground shrink-0 ml-1.5"
                            title="Copy command"
                          >
                            {copiedIndex === cIdx ? (
                              <Check className="h-3 w-3 text-emerald-500 animate-bounce" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{command.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
