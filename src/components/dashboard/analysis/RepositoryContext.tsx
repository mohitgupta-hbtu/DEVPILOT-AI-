import React, { createContext, useContext } from "react";
import { RepositoryAnalysis } from "@/types";

interface RepositoryContextType {
  activeResult: RepositoryAnalysis | null;
  isScanning: boolean;
  scanProgress: number;
  logs: string[];
  triggerAnalysis: (repoUrl: string, branch?: string, depth?: string) => void;
  onNavigateToFile?: (filePath: string) => void;
  history: RepositoryAnalysis[];
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: RepositoryContextType;
}) {
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return context;
}
