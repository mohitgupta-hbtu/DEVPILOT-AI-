import { RepositoryAnalysis, RoadmapItem, Dependency } from "@/types";

export interface AIServiceInterface {
  /**
   * Generates a comprehensive architectural and health analysis for a target GitHub repository
   * using the FastAPI backend.
   */
  generateRepositoryAnalysis(repoUrl: string, depth?: string): Promise<RepositoryAnalysis>;
}

interface RawLanguage {
  name: string;
  percentage: number;
  color?: string;
}

interface RawRoadmapItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
  items?: string[];
}

interface RawDependency {
  name: string;
  version: string;
  type?: string;
}

interface RawFolderNode {
  name: string;
  type: string;
  children?: RawFolderNode[];
}

interface RawGoodFirstIssue {
  id: string;
  title: string;
  number: number;
  labels: string[];
  difficulty: string;
}

interface RawAnalysisResponse {
  repository: {
    owner: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
  };
  languages: RawLanguage[];
  summary: {
    techStack: string[];
    entryPoints: string[];
    suggestedStartingFolders: string[];
  };
  health: {
    healthScore: number;
    metrics: {
      documentation: number;
      codeQuality: number;
      maintainability: number;
      complexity: number;
      testing: number;
    };
    recommendations?: Array<{
      id: string;
      category: string;
      title: string;
      description: string;
      severity: "high" | "medium" | "low";
      suggestion?: string;
    }>;
    explanations?: Record<string, string>;
  };
  roadmap: RawRoadmapItem[];
  goodFirstIssues?: RawGoodFirstIssue[];
  architecture: {
    dependencies: RawDependency[];
    folderStructure: RawFolderNode;
  };
}

export class AIService implements AIServiceInterface {
  async generateRepositoryAnalysis(repoUrl: string, depth = "deep"): Promise<RepositoryAnalysis> {
    console.info(
      `AIService: Fetching real-time architecture scan for ${repoUrl} from FastAPI backend...`,
    );

    // Retrieve settings dynamically to grab the latest user-input API key and GitHub PAT
    let geminiApiKey: string | undefined = undefined;
    let openrouterApiKey: string | undefined = undefined;
    let githubToken: string | undefined = undefined;
    if (typeof window !== "undefined") {
      try {
        const storedSettings = localStorage.getItem("devpilot_settings");
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed) {
            if (parsed.geminiKey) {
              geminiApiKey = parsed.geminiKey;
            }
            if (parsed.openrouterKey) {
              openrouterApiKey = parsed.openrouterKey;
            }
            if (parsed.githubToken) {
              githubToken = parsed.githubToken;
            }
          }
        }
      } catch (err) {
        console.warn("AIService: Failed to read devpilot_settings from localStorage", err);
      }
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryUrl: repoUrl,
          geminiApiKey,
          openrouterApiKey,
          githubToken,
        }),
      });

      if (!response.ok) {
        let errMsg = `Server returned status ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody && errBody.detail) {
            errMsg = errBody.detail;
          }
        } catch {
          // Fallback to text body
          const txtBody = await response.text();
          if (txtBody) errMsg = txtBody;
        }
        throw new Error(errMsg);
      }

      const rawData = (await response.json()) as RawAnalysisResponse;

      // Conforms to exact RepositoryAnalysis type contract
      return {
        id: String(Date.now()),
        repoUrl: repoUrl,
        owner: rawData.repository.owner || "unknown",
        name: rawData.repository.name || "unknown-repo",
        description: rawData.repository.description || "No description available.",
        stars: rawData.repository.stars ?? 0,
        forks: rawData.repository.forks ?? 0,
        languages: (rawData.languages || []).map((l: RawLanguage) => ({
          name: l.name,
          percentage: l.percentage,
          color: l.color || "#858585",
        })),
        techStack: rawData.summary.techStack || ["Unknown"],
        healthScore: rawData.health.healthScore ?? 80,
        healthMetrics: {
          documentation: rawData.health.metrics.documentation ?? 80,
          codeQuality: rawData.health.metrics.codeQuality ?? 80,
          maintainability: rawData.health.metrics.maintainability ?? 80,
          complexity: rawData.health.metrics.complexity ?? 80,
          testing: rawData.health.metrics.testing ?? 80,
        },
        healthRecommendations: rawData.health.recommendations || [],
        healthExplanations: rawData.health.explanations || {},
        entryPoints: rawData.summary.entryPoints || ["README.md"],
        suggestedStartingFolders: rawData.summary.suggestedStartingFolders || ["/"],
        roadmap: (rawData.roadmap || []).map((r: RawRoadmapItem) => ({
          id: r.id,
          phase: r.phase,
          title: r.title,
          description: r.description,
          estimatedTime: r.estimatedTime,
          difficulty: r.difficulty as RoadmapItem["difficulty"],
          items: r.items || [],
        })),
        goodFirstIssues: rawData.goodFirstIssues
          ? rawData.goodFirstIssues.map((issue) => ({
              id: issue.id,
              title: issue.title,
              number: issue.number,
              labels: issue.labels,
              difficulty: issue.difficulty as "Easy" | "Medium" | "Hard",
            }))
          : (rawData.roadmap[0]?.items || []).map((it: string, idx: number) => ({
              id: `gfi-${Date.now()}-${idx}`,
              title: it,
              number: 200 + idx,
              labels: ["good first issue", "onboarding"],
              difficulty: "Easy" as const,
            })),
        dependencies: (rawData.architecture.dependencies || []).map((dep: RawDependency) => ({
          name: dep.name,
          version: dep.version,
          type: (dep.type || "core") as Dependency["type"],
        })),
        folderStructure: (rawData.architecture.folderStructure || {
          name: rawData.repository.name || "repo",
          type: "directory" as const,
          children: [],
        }) as RepositoryAnalysis["folderStructure"],
        scannedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      console.error("AIService integration error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(errMsg || "An unexpected error occurred during repository analysis.");
    }
  }
}

export const aiService = new AIService();
export default aiService;
