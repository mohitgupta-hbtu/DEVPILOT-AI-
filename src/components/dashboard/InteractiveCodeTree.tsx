import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  File,
  Search,
  Filter,
  Check,
  Copy,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCode,
  Info,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Hash,
  AlertTriangle,
  Flame,
  MousePointerClick,
  Download,
} from "lucide-react";
import { FolderNode } from "@/types";
import { getFileExplanation, FileExplanation } from "@/utils/fileExplainer";

interface InteractiveCodeTreeProps {
  folderStructure: FolderNode;
  repoUrl: string;
  repoName: string;
  selectedFile: string;
  onSelectFile: (filePath: string) => void;
}

// Deterministic developer file metrics generator based on filename/hash
export function getSimulatedFileMetrics(fileName: string) {
  if (!fileName) return { lines: 0, sizeKb: 0, complexity: "Low" as const };
  const hash = fileName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let baseLines = 45;
  let baseKb = 1.8;

  if (["tsx", "ts", "js", "jsx"].includes(ext)) {
    baseLines = 110;
    baseKb = 3.6;
  } else if (["py", "go", "rs", "cpp"].includes(ext)) {
    baseLines = 160;
    baseKb = 5.2;
  } else if (["md"].includes(ext)) {
    baseLines = 30;
    baseKb = 1.1;
  } else if (["json"].includes(ext)) {
    baseLines = 50;
    baseKb = 2.1;
  }

  const lines = baseLines + (hash % 70);
  const sizeKb = Number((baseKb + (hash % 12) / 3.5).toFixed(1));
  const complexity: "Low" | "Medium" | "High" =
    lines > 140 ? "High" : lines > 75 ? "Medium" : "Low";
  return { lines, sizeKb, complexity };
}

// Flat file extractor helper
interface FlatFile {
  name: string;
  path: string;
  extension: string;
  sizeKb: number;
  lines: number;
  complexity: "Low" | "Medium" | "High";
}

function flattenFolderStructure(node: FolderNode, parentPath = ""): FlatFile[] {
  if (!node) return [];
  const nodeName = node.name || "";
  const currentPath = parentPath ? `${parentPath}/${nodeName}` : nodeName;
  let files: FlatFile[] = [];

  if (node.type === "file") {
    const ext = nodeName ? nodeName.split(".").pop()?.toLowerCase() || "" : "";
    const metrics = getSimulatedFileMetrics(nodeName);
    files.push({
      name: nodeName,
      path: currentPath,
      extension: ext,
      sizeKb: metrics.sizeKb,
      lines: metrics.lines,
      complexity: metrics.complexity,
    });
  } else if (node.children) {
    for (const child of node.children) {
      if (child) {
        files = [...files, ...flattenFolderStructure(child, currentPath)];
      }
    }
  }

  return files;
}

interface FolderTreeNodeProps {
  node: FolderNode;
  depth?: number;
  parentPath?: string;
  selectedFile: string;
  onSelectFile: (filePath: string) => void;
  reviewedFiles: Record<string, boolean>;
  onToggleReviewed: (path: string) => void;
}

export function FolderTreeNode({
  node,
  depth = 0,
  parentPath = "",
  selectedFile,
  onSelectFile,
  reviewedFiles,
  onToggleReviewed,
}: FolderTreeNodeProps) {
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);

  if (!node) return null;

  const nodeName = node.name || "";
  const currentPath = parentPath ? `${parentPath}/${nodeName}` : nodeName;
  const isDir = node.type === "directory";
  const isSelected = selectedFile === currentPath;
  const isReviewed = !!reviewedFiles[currentPath];

  const handleSelect = () => {
    if (isDir) {
      setIsFolderExpanded(!isFolderExpanded);
    } else {
      onSelectFile(currentPath);
    }
  };

  return (
    <div className="select-none text-left font-mono">
      <div
        onClick={handleSelect}
        className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
          isDir
            ? "hover:bg-muted/40 text-foreground/80 font-semibold"
            : isSelected
              ? "bg-primary/15 text-primary border-l-2 border-primary"
              : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isDir ? (
            <>
              {isFolderExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <Folder className="h-4 w-4 text-primary fill-primary/10 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              <File
                className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
              />
            </>
          )}
          <span
            className={`text-[11px] font-mono truncate ${isSelected ? "font-bold text-primary" : ""}`}
          >
            {nodeName}
          </span>
          {!isDir && (
            <span className="text-[9px] text-muted-foreground/50 font-mono hidden sm:inline ml-1.5 whitespace-nowrap shrink-0 group-hover:text-muted-foreground/80">
              ({getSimulatedFileMetrics(nodeName).lines} LOC,{" "}
              {getSimulatedFileMetrics(nodeName).sizeKb} KB)
            </span>
          )}
        </div>

        {/* Quick interactive checklist check on tree node */}
        {!isDir && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleReviewed(currentPath);
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-muted transition-all shrink-0"
            title={isReviewed ? "Mark as unreviewed" : "Mark as reviewed"}
          >
            <CheckCircle
              className={`h-3.5 w-3.5 ${isReviewed ? "text-emerald-500 fill-emerald-500/10" : "text-muted-foreground/40"}`}
            />
          </button>
        )}

        {/* Persistent check indicator on tree node */}
        {!isDir && isReviewed && !isSelected && (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500/80 fill-emerald-500/5 shrink-0 group-hover:hidden" />
        )}
      </div>

      {isDir && isFolderExpanded && node.children && (
        <div className="space-y-0.5">
          {node.children.map((child, idx) => (
            <FolderTreeNode
              key={idx}
              node={child}
              depth={depth + 1}
              parentPath={currentPath}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              reviewedFiles={reviewedFiles}
              onToggleReviewed={onToggleReviewed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function InteractiveCodeTree({
  folderStructure,
  repoUrl,
  repoName,
  selectedFile,
  onSelectFile,
}: InteractiveCodeTreeProps) {
  const storageReviewedKey = `devpilot_reviewed_files_${repoUrl}`;

  // State to store files marked as reviewed by the developer
  const [reviewedFiles, setReviewedFiles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageReviewedKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string | null>(null);
  const [codeFontSize, setCodeFontSize] = useState<"xs" | "sm" | "base" | "lg">("sm");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // State to hold dynamically fetched real source code from GitHub Raw Content API
  const [liveCodeCache, setLiveCodeCache] = useState<Record<string, string>>({});
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  // Flatten the entire file system to run queries, stats, and filtered views
  const flatFiles = useMemo(() => {
    return flattenFolderStructure(folderStructure);
  }, [folderStructure]);

  // Auto-select the best entry point file on initial load if none is active
  useEffect(() => {
    if (!selectedFile && flatFiles.length > 0) {
      const candidates = ["README.md", "package.json", "src/App.tsx", "main.py", "index.html"];
      // exact matches
      let found = flatFiles.find((f) => f && f.name && candidates.includes(f.name));
      if (!found) {
        // partial matches
        found = flatFiles.find(
          (f) =>
            f &&
            f.name &&
            ((f.name || "").toLowerCase().includes("readme") ||
              (f.name || "").toLowerCase().includes("app") ||
              (f.name || "").toLowerCase().includes("main")),
        );
      }
      if (!found) {
        // fallback to first
        found = flatFiles[0];
      }
      if (found) {
        onSelectFile(found.path);
      }
    }
  }, [selectedFile, flatFiles, onSelectFile]);

  // Save reviewed files
  useEffect(() => {
    localStorage.setItem(storageReviewedKey, JSON.stringify(reviewedFiles));
  }, [reviewedFiles, storageReviewedKey]);

  // Network-level fetcher for accurate raw content
  useEffect(() => {
    if (!selectedFile || !repoUrl) return;
    if (liveCodeCache[selectedFile] !== undefined) return;

    const fetchRawCode = async () => {
      setIsLoadingCode(true);
      try {
        const cleanUrl = repoUrl
          .replace("https://github.com/", "")
          .replace("http://github.com/", "");
        const parts = cleanUrl.split("/");

        if (parts.length >= 2) {
          const owner = parts[0];
          const repoNameParam = parts[1];
          let res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repoNameParam}/main/${selectedFile}`,
          );
          if (!res.ok) {
            res = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repoNameParam}/master/${selectedFile}`,
            );
          }
          if (res.ok) {
            const text = await res.text();
            setLiveCodeCache((prev) => ({ ...prev, [selectedFile]: text }));
          } else {
            setLiveCodeCache((prev) => ({ ...prev, [selectedFile]: "" }));
          }
        }
      } catch (err) {
        setLiveCodeCache((prev) => ({ ...prev, [selectedFile]: "" }));
      } finally {
        setIsLoadingCode(false);
      }
    };

    fetchRawCode();
  }, [selectedFile, repoUrl, liveCodeCache]);

  // Total files count
  const totalFilesCount = flatFiles.length;

  // File extension distribution calculations
  const extensionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    flatFiles.forEach((f) => {
      if (f && f.extension) {
        const ext = f.extension.toUpperCase() || "OTHER";
        counts[ext] = (counts[ext] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([ext, count]) => {
      const percentage = Math.round((count / totalFilesCount) * 100);
      let color = "bg-primary";
      if (ext === "TS" || ext === "TSX") color = "bg-blue-500";
      else if (ext === "PY") color = "bg-yellow-500";
      else if (ext === "JSON") color = "bg-purple-500";
      else if (ext === "CSS") color = "bg-pink-500";
      else if (ext === "MD") color = "bg-emerald-500";

      return { ext, count, percentage, color };
    });
  }, [flatFiles, totalFilesCount]);

  // Filter flat files list based on search, format, complexity, and review status selectors
  const filteredFlatFiles = useMemo(() => {
    return flatFiles.filter((f) => {
      if (!f) return false;
      const pathLower = (f.path || "").toLowerCase();
      const queryLower = (searchQuery || "").toLowerCase();
      const matchesSearch = pathLower.includes(queryLower);
      const matchesExt =
        !selectedExtension || (f.extension || "").toUpperCase() === selectedExtension;
      const matchesComplexity =
        !selectedComplexity || f.complexity.toUpperCase() === selectedComplexity.toUpperCase();
      const matchesReview =
        !selectedReviewStatus ||
        (selectedReviewStatus === "REVIEWED" ? !!reviewedFiles[f.path] : !reviewedFiles[f.path]);

      return matchesSearch && matchesExt && matchesComplexity && matchesReview;
    });
  }, [
    flatFiles,
    searchQuery,
    selectedExtension,
    selectedComplexity,
    selectedReviewStatus,
    reviewedFiles,
  ]);

  // Handle Mark as Reviewed
  const handleToggleReviewed = (path: string) => {
    setReviewedFiles((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const reviewedCount = Object.keys(reviewedFiles).filter(
    (k) => reviewedFiles[k] && flatFiles.some((f) => f.path === k),
  ).length;

  const reviewProgressRatio =
    totalFilesCount > 0 ? Math.round((reviewedCount / totalFilesCount) * 100) : 0;

  // Fetch explanation metadata for the active selected file
  const activeFileExplanation: FileExplanation = useMemo(() => {
    return getFileExplanation(selectedFile || flatFiles[0]?.path || "src/App.tsx", repoName);
  }, [selectedFile, flatFiles, repoName]);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAiPrompt = () => {
    if (!selectedFile) return;
    const codeText = liveCodeCache[selectedFile] || activeFileExplanation.code;
    const promptText = `I am analyzing the following file from the repository "${repoName}".

### File Path:
\`${selectedFile}\`

### File Purpose & Context:
${activeFileExplanation.purpose}

### Code Content:
\`\`\`
${codeText}
\`\`\`

Based on this code and context, please analyze potential logic bugs, explain its architectural role, and provide 3 refactoring improvements.`;
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportReport = () => {
    if (!selectedFile) return;
    const fileName = selectedFile.split("/").pop() || "file";
    const metrics = getSimulatedFileMetrics(fileName);
    const reportContent = `# DevPilot System Audit Report: ${fileName}
**Repository:** ${repoName}
**File Location:** \`${selectedFile}\`
**Analysis Date:** ${new Date().toLocaleDateString()}
**Status:** ${reviewedFiles[selectedFile] ? "Reviewed ✓" : "Pending Review"}

---

## 📊 File Sizing & Metrics
- **Complexity Rating:** ${activeFileExplanation.complexity} Complexity
- **Simulated File Sizing:** ${metrics.lines} estimated lines of code (LOC)
- **Weight:** ${metrics.sizeKb} KB

---

## 🎯 Code Purpose & Architecture Summary
${activeFileExplanation.purpose}

---

## ⚙️ Core Modules, Functions & Event Handlers
${activeFileExplanation.methods.map((method) => `- \`${method}\``).join("\n")}

---

## 🧠 AI Refactoring & Sizing Recommendations
${activeFileExplanation.suggestions.map((sug) => `- [ ] ${sug}`).join("\n")}

---
*Report automatically generated by DevPilot Developer Intelligence Workspace.*
`;
    const blob = new Blob([reportContent.trim()], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName.replace(/\.[^/.]+$/, "")}_audit_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetReviewed = () => {
    if (confirm("Are you sure you want to reset all file review marks?")) {
      setReviewedFiles({});
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. REPOSITORY SUMMARY BENTO DECK */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
        {/* Core CodeTree Usecase and Overview */}
        <div className="md:col-span-12 rounded-xl border border-border bg-card/35 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 text-primary/5 pointer-events-none">
            <BookOpen className="h-40 w-40" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Repository File Companion
              </h4>
            </div>

            <h3 className="text-lg font-bold text-foreground">
              What is the Usecase of the Code Tree?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              The Code Tree provides structural, static code browser capabilities natively in your
              DevPilot workspace. It enables developers to perform rapid reviews of raw scripts,
              understand structural nesting layers, and receive direct AI insights (Purpose, Sizing,
              Key methods, and Refactoring advice) for any selected file.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-border/30">
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Click on file extensions below to filter directories quickly.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILE EXTENSIONS SUMMARY INTERACTIVE BADGES */}
      <div className="rounded-xl border border-border bg-card/35 p-4 flex flex-wrap items-center gap-2.5 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono mr-2 flex items-center gap-1 shrink-0">
          <Filter className="h-3 w-3 text-primary" />
          Quick filter format:
        </span>

        <button
          onClick={() => setSelectedExtension(null)}
          className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded transition-all ${
            selectedExtension === null
              ? "bg-primary text-background"
              : "bg-background/40 hover:bg-muted text-muted-foreground border border-border/50"
          }`}
        >
          ALL FILES ({totalFilesCount})
        </button>

        {extensionStats.map((item) => {
          const isActive = selectedExtension === item.ext;
          return (
            <button
              key={item.ext}
              onClick={() => setSelectedExtension(isActive ? null : item.ext)}
              className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-background"
                  : "bg-background/40 hover:bg-muted text-foreground border border-border/50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
              <span>.{item.ext.toLowerCase()}</span>
              <span className="opacity-70 text-[9px]">({item.count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. CORE TWO-PANE LAYOUT: CODE TREE SIDEBAR & VIEWER/AI EXPLAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar Pane: File search and selection list (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card/35 p-5 space-y-4 text-left">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground">Repository Workspace Directory</h3>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file names (e.g. App.tsx, styles...)"
                className="w-full rounded-lg border border-border bg-background px-9 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[10px] text-muted-foreground hover:text-foreground font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Advanced Multi-faceted Developer Filters */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              {/* Complexity Select Filter */}
              <div className="space-y-1">
                <span className="text-muted-foreground text-[9px] uppercase font-bold block">
                  Complexity:
                </span>
                <select
                  value={selectedComplexity || ""}
                  onChange={(e) => setSelectedComplexity(e.target.value || null)}
                  className="w-full text-[10px] bg-background border border-border rounded px-1.5 py-1 text-foreground focus:outline-none"
                >
                  <option value="" className="bg-background text-foreground">
                    All Complexities
                  </option>
                  <option value="LOW" className="bg-background text-foreground">
                    Low Complexity
                  </option>
                  <option value="MEDIUM" className="bg-background text-foreground">
                    Medium Complexity
                  </option>
                  <option value="HIGH" className="bg-background text-foreground">
                    High Complexity
                  </option>
                </select>
              </div>

              {/* Review Checklist Filter */}
              <div className="space-y-1">
                <span className="text-muted-foreground text-[9px] uppercase font-bold block">
                  Audit Status:
                </span>
                <select
                  value={selectedReviewStatus || ""}
                  onChange={(e) => setSelectedReviewStatus(e.target.value || null)}
                  className="w-full text-[10px] bg-background border border-border rounded px-1.5 py-1 text-foreground focus:outline-none"
                >
                  <option value="" className="bg-background text-foreground">
                    All Statuses
                  </option>
                  <option value="REVIEWED" className="bg-background text-foreground">
                    Reviewed Only
                  </option>
                  <option value="PENDING" className="bg-background text-foreground">
                    Pending Review
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory listing Container */}
          <div className="bg-background/40 border border-border/60 rounded-xl p-3 overflow-y-auto max-h-[480px] min-h-[360px] space-y-0.5">
            {searchQuery || selectedExtension || selectedComplexity || selectedReviewStatus ? (
              // Flat filtered query search list
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono px-2 block mb-2">
                  Matching Search Results ({filteredFlatFiles.length})
                </span>

                {filteredFlatFiles.length === 0 ? (
                  <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground/60 text-xs text-center space-y-2">
                    <AlertTriangle className="h-6 w-6 text-muted-foreground/50" />
                    <p>No code files match active query filters.</p>
                  </div>
                ) : (
                  filteredFlatFiles.map((file) => {
                    const isSelected = selectedFile === file.path;
                    const isReviewed = !!reviewedFiles[file.path];
                    return (
                      <div
                        key={file.path}
                        onClick={() => onSelectFile(file.path)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary/15 text-primary border-l-2 border-primary"
                            : "hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <File
                            className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <div className="truncate text-left">
                            <div className="flex items-baseline gap-1.5">
                              <span
                                className={`block truncate ${isSelected ? "font-bold text-primary" : "text-foreground/90"}`}
                              >
                                {file.name}
                              </span>
                              <span className="text-[9px] text-muted-foreground/60 font-mono">
                                ({file.lines} lines, {file.sizeKb} KB)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="block text-[9px] text-muted-foreground font-mono truncate max-w-[150px]">
                                {file.path}
                              </span>
                              <span
                                className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                                  file.complexity === "Low"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : file.complexity === "Medium"
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-rose-500/10 text-rose-400"
                                }`}
                              >
                                {file.complexity}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reviewed checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReviewed(file.path);
                          }}
                          className="p-1 rounded hover:bg-muted/80 shrink-0"
                        >
                          <CheckCircle
                            className={`h-3.5 w-3.5 ${isReviewed ? "text-emerald-500 fill-emerald-500/10" : "text-muted-foreground/30"}`}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              // Standard Collapsible Folder Tree view
              <FolderTreeNode
                node={folderStructure}
                depth={0}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                reviewedFiles={reviewedFiles}
                onToggleReviewed={handleToggleReviewed}
              />
            )}
          </div>
        </div>

        {/* Right Pane: Code Viewer, AI Explanation & Q&A interactions (7 cols) */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {selectedFile ? (
            <div className="space-y-5">
              {/* Selected File header details card */}
              <div className="rounded-xl border border-border bg-card/35 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 font-mono">
                  <div className="flex items-center gap-2 text-xs">
                    <File className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground break-all">{selectedFile}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                        activeFileExplanation.complexity === "Low"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : activeFileExplanation.complexity === "Medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {activeFileExplanation.complexity} Complexity
                    </span>

                    {/* Interactive Review Switch */}
                    <button
                      onClick={() => handleToggleReviewed(selectedFile)}
                      className={`h-6 rounded px-2 text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                        reviewedFiles[selectedFile]
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      {reviewedFiles[selectedFile] ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Reviewed</span>
                        </>
                      ) : (
                        "Mark Reviewed"
                      )}
                    </button>
                  </div>
                </div>

                {/* Purpose text */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    File Purpose Summary
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {activeFileExplanation.purpose}
                  </p>
                </div>

                {/* Key methods list */}
                <div className="space-y-1.5 pt-2 border-t border-border/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                    Core Function Blocks & Handlers
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {activeFileExplanation.methods.map((method, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 bg-background/30 p-2 rounded border border-border/40"
                      >
                        <span className="text-primary font-mono shrink-0">#</span>
                        <span className="leading-snug text-[11px]">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Playground View (Syntax formatted container) */}
              <div className="rounded-xl border border-border bg-card/35 overflow-hidden">
                <div className="bg-muted/30 border-b border-border/50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase">
                      Code View Sandbox
                    </span>
                    {/* Font Sizing Controls */}
                    <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded border border-border/50 text-[9px] font-mono">
                      <span className="text-[8px] text-muted-foreground/80 px-1 uppercase font-bold">
                        Size:
                      </span>
                      {(["xs", "sm", "base", "lg"] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setCodeFontSize(sz)}
                          className={`px-1.5 py-0.5 rounded uppercase transition-colors font-bold ${
                            codeFontSize === sz
                              ? "bg-primary text-background"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Export Audit Report Button */}
                    <button
                      onClick={handleExportReport}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono bg-background/50 border border-border px-2.5 py-1 rounded transition-colors"
                      title="Download full Markdown developer audit report"
                    >
                      <Download className="h-3 w-3 text-primary" />
                      <span>Export Report</span>
                    </button>

                    <button
                      onClick={handleCopyAiPrompt}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded transition-colors"
                      title="Copy complete file code + architecture summary formatted as a prompt template for LLMs"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Prompt Copied!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span>AI Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleCopyCode(liveCodeCache[selectedFile] || activeFileExplanation.code)
                      }
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono bg-background/50 border border-border px-2 py-1 rounded transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Highlight format */}
                <div
                  className={`p-4 bg-background font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-text max-h-[300px] transition-all ${
                    codeFontSize === "xs"
                      ? "text-[10px]"
                      : codeFontSize === "sm"
                        ? "text-[12px]"
                        : codeFontSize === "base"
                          ? "text-[14px]"
                          : "text-[16px]"
                  }`}
                >
                  <table className="w-full border-collapse">
                    <tbody>
                      {isLoadingCode && !liveCodeCache[selectedFile] ? (
                        <tr>
                          <td className="pl-4 py-8 text-center text-muted-foreground animate-pulse text-xs">
                            Fetching live source from GitHub...
                          </td>
                        </tr>
                      ) : (
                        (liveCodeCache[selectedFile] || activeFileExplanation.code)
                          .split("\n")
                          .map((line, idx) => (
                            <tr key={idx} className="hover:bg-muted/5">
                              <td className="text-muted-foreground/30 text-right pr-4 select-none w-6 border-r border-border/20 text-[10px]">
                                {idx + 1}
                              </td>
                              <td className="pl-4 text-left whitespace-pre break-words">
                                {line || " "}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/30 p-12 text-center space-y-3">
              <MousePointerClick className="h-10 w-10 text-muted-foreground/60 mx-auto animate-bounce" />
              <h3 className="text-sm font-semibold text-foreground">No File Selected</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Select any code file from the workspace directory tree on the left pane to explore
                its full logic blueprints.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
