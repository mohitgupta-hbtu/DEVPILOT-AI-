import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RepositoryAnalysis, SandboxSettings } from "@/types";
import { DashboardContext } from "@/contexts/DashboardContext";
import { storageService } from "@/services/storage";
import { analysisAPI } from "@/services/api/analysis";
import { gitHubUrlSchema } from "@/utils/validation";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<RepositoryAnalysis[]>([]);
  const [activeScan, setActiveScanState] = useState<RepositoryAnalysis | null>(null);
  const [settings, setSettings] = useState<SandboxSettings>(() => storageService.getSettings());
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  // Synchronize history and active scan on mount
  useEffect(() => {
    setHistory(storageService.getScanHistory());
    setActiveScanState(storageService.getActiveScan());
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const triggerAnalysis = async (repoUrl: string, branch = "main", depth = "deep") => {
    if (!repoUrl.trim()) return;

    // 1. Zod URL validation
    const validationResult = gitHubUrlSchema.safeParse(repoUrl);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid repository URL";
      setIsScanning(true);
      setLogs([]);
      setActiveScanState(null);
      setCurrentStage(0);
      setScanProgress(0);
      addLog(`❌ VALIDATION FIELD FAILED: ${repoUrl}`);
      addLog(`ERROR: ${errorMessage}`);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setActiveScanState(null);
    setCurrentStage(0);
    setScanProgress(5);

    addLog(`INIT: Establishing connection with API gateway...`);
    addLog(`CONFIG: Target URL [${repoUrl}]`);
    addLog(`CONFIG: Target Branch [${branch}], Parsing Depth [${depth}]`);

    let progressTally = 5;

    // Setup visual mock steps placeholder log helper (so screen updates during http duration)
    const logInterval = setInterval(() => {
      progressTally = Math.min(progressTally + 12, 90);
      setScanProgress(progressTally);
      const logOptions = [
        "FETCH: Reading remote repository hierarchy...",
        "PARSE: Resolving manifest configuration dependencies...",
        "ANALYSIS: Scanning code AST layers for patterns...",
        "HEALTH: Calculating quality metrics and static recommendations...",
      ];
      const randomLog = logOptions[Math.floor(Math.random() * logOptions.length)];
      addLog(randomLog);
    }, 1500);

    try {
      addLog(`HTTP: POST /api/analyze pending...`);
      const analysis = await analysisAPI.scanCodebase({
        repositoryUrl: repoUrl,
        branch,
        depth,
      });

      clearInterval(logInterval);

      // Smoothly walk and animate through all remaining stages to show complete checklist progress
      let currentProgress = progressTally;
      const nextSteps = [
        { target: 45, log: "PARSE: Compiling AST dependency graph nodes..." },
        { target: 65, log: "ANALYSIS: Auditing structural code smells & cognitive complexity..." },
        {
          target: 85,
          log: "HEALTH: Computing compiler rules, rules configuration & linter quality...",
        },
        { target: 100, log: "DISPATCH: Linking directory nodes to the workspace UI model..." },
      ];

      for (const step of nextSteps) {
        if (currentProgress < step.target) {
          const diff = step.target - currentProgress;
          const subSteps = 5;
          const inc = diff / subSteps;
          for (let i = 0; i < subSteps; i++) {
            currentProgress += inc;
            setScanProgress(Math.round(currentProgress));
            await new Promise((r) => setTimeout(r, 60));
          }
          addLog(step.log);
          await new Promise((r) => setTimeout(r, 450));
        }
      }

      setScanProgress(100);
      setCurrentStage(6);

      addLog(`HTTP: Payload received successfully. Processing metadata mapping...`);
      await new Promise((r) => setTimeout(r, 400));
      setIsScanning(false);

      storageService.saveScanToHistory(analysis);
      storageService.setActiveScan(analysis);

      // Increment local tally safely
      const currentCount = Number(localStorage.getItem("devpilot_scan_count") || "0");
      localStorage.setItem("devpilot_scan_count", String(currentCount + 1));

      setActiveScanState(analysis);
      setHistory(storageService.getScanHistory());

      // Navigate home/scan page to reload data parameters
      navigate({ to: "/analyze", search: {} });
    } catch (err: unknown) {
      clearInterval(logInterval);
      setIsScanning(false);
      setScanProgress(0);
      setCurrentStage(0);

      const errorMsg =
        err instanceof Error ? err.message : "An unexpected network failure occurred.";
      addLog(`❌ ERROR: AST Parsing Daemon Failed.`);
      addLog(`STATUS: ${errorMsg}`);

      if (errorMsg.includes("429") || errorMsg.includes("quota")) {
        addLog("SOLUTION: Please provide your own personal API Key in the settings tab.");
      } else {
        addLog("HINT: Ensure your local FastAPI backend is active on port 8000.");
      }
    }
  };

  const deleteScan = (id: string) => {
    storageService.deleteScanFromHistory(id);
    setHistory(storageService.getScanHistory());

    const currentActive = storageService.getActiveScan();
    if (currentActive?.id === id || !currentActive) {
      const updatedHistory = storageService.getScanHistory();
      if (updatedHistory.length > 0) {
        storageService.setActiveScan(updatedHistory[0]);
        setActiveScanState(updatedHistory[0]);
      } else {
        localStorage.removeItem("devpilot_active_scan");
        setActiveScanState(null);
      }
    }
  };

  const loadScan = (scan: RepositoryAnalysis) => {
    storageService.setActiveScan(scan);
    setActiveScanState(scan);
  };

  const updateSettings = (updated: Partial<SandboxSettings>) => {
    const nextSettings = { ...settings, ...updated };
    setSettings(nextSettings);
    storageService.saveSettings(nextSettings);
  };

  const clearActiveScan = () => {
    setActiveScanState(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        history,
        activeScan,
        settings,
        isScanning,
        currentStage,
        scanProgress,
        logs,
        triggerAnalysis,
        deleteScan,
        loadScan,
        updateSettings,
        clearActiveScan,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
export default DashboardProvider;
