/* eslint-disable @typescript-eslint/no-explicit-any */
import { RepositoryAnalysis } from "@/types";
import { apiFetch } from "./client";

export interface AnalyzePayload {
  repositoryUrl: string;
  branch?: string;
  depth?: string;
}

export const analysisAPI = {
  /**
   * Dispatches the repository URL to the backend FastAPI analyzer.
   * Leverages Gemini or OpenRouter parameters injected automatically by the apiClient.
   */
  async scanCodebase(payload: AnalyzePayload): Promise<RepositoryAnalysis> {
    const rawData = await apiFetch<any>("/api/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Translate to matching runtime frontend RepositoryAnalysis schema contract
    return {
      id: String(Date.now()),
      repoUrl: payload.repositoryUrl,
      owner: rawData.repository.owner || "unknown",
      name: rawData.repository.name || "unknown-repo",
      description: rawData.repository.description || "No description available.",
      stars: rawData.repository.stars ?? 0,
      forks: rawData.repository.forks ?? 0,
      languages: (rawData.languages || []).map((l: any) => ({
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
      roadmap: (rawData.roadmap || []).map((r: any) => ({
        id: r.id || String(Math.random()),
        phase: r.phase,
        title: r.title,
        description: r.description,
        estimatedTime: r.estimatedTime,
        difficulty: r.difficulty || "Intermediate",
        items: r.items || [],
      })),
      goodFirstIssues: (rawData.goodFirstIssues || []).map((issue: any, index: number) => ({
        id: issue.id || `gfi-${index}`,
        title: issue.title,
        number: issue.number || 200 + index,
        labels: issue.labels || ["good first issue"],
        difficulty: issue.difficulty || "Easy",
      })),
      dependencies: (rawData.architecture.dependencies || []).map((dep: any) => ({
        name: dep.name,
        version: dep.version || "latest",
        type: dep.type || "core",
      })),
      folderStructure: rawData.architecture.folderStructure || {
        name: rawData.repository.name || "repo",
        type: "directory",
        children: [],
      },
      scannedAt: new Date().toISOString(),
    };
  },
};
