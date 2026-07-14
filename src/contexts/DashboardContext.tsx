import { createContext } from "react";
import { RepositoryAnalysis, SandboxSettings } from "@/types";

export interface DashboardContextType {
  history: RepositoryAnalysis[];
  activeScan: RepositoryAnalysis | null;
  settings: SandboxSettings;
  isScanning: boolean;
  currentStage: number;
  scanProgress: number;
  logs: string[];
  triggerAnalysis: (repoUrl: string, branch?: string, depth?: string) => void;
  deleteScan: (id: string) => void;
  loadScan: (scan: RepositoryAnalysis) => void;
  updateSettings: (settings: Partial<SandboxSettings>) => void;
  clearActiveScan: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
export default DashboardContext;
