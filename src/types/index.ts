export interface HealthMetrics {
  documentation: number;
  codeQuality: number;
  maintainability: number;
  complexity: number;
  testing: number;
}

export interface RoadmapItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  items: string[];
}

export interface GoodFirstIssue {
  id: string;
  title: string;
  number: number;
  labels: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Dependency {
  name: string;
  version: string;
  type: "core" | "dev";
}

export interface FolderNode {
  name: string;
  type: "file" | "directory";
  children?: FolderNode[];
}

export interface LanguageDistribution {
  name: string;
  percentage: number;
  color: string;
}

export interface HealthRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  suggestion?: string;
}

export interface HealthExpl {
  documentation?: string;
  codeQuality?: string;
  maintainability?: string;
  complexity?: string;
  testing?: string;
}

export interface RepositoryAnalysis {
  id: string;
  repoUrl: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  languages: LanguageDistribution[];
  techStack: string[];
  healthScore: number;
  healthMetrics: HealthMetrics;
  healthRecommendations?: HealthRecommendation[];
  healthExplanations?: HealthExpl;
  entryPoints: string[];
  suggestedStartingFolders: string[];
  roadmap: RoadmapItem[];
  goodFirstIssues: GoodFirstIssue[];
  dependencies: Dependency[];
  folderStructure: FolderNode;
  scannedAt: string;
}

export interface SandboxSettings {
  theme: "dark" | "light";
  animationSpeed: number; // in ms
  cacheLifetime: number; // in days
  geminiKey?: string;
  openaiKey?: string;
  openrouterKey?: string;
  githubToken?: string;
  isGitHubConnected: boolean;
  defaultWorkspaceId?: string;
  layoutStyle?: "standard" | "compact";
}

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  icon: string; // lucide icon name
  unread: boolean;
}
