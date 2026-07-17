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
    if (payload.repositoryUrl.toLowerCase().includes("devpilot/demo")) {
      console.log("DEMO MODE TRIGGERED");
      // Create an elaborate fake response for demo purposes
      await new Promise((res) => setTimeout(res, 2000));
      return {
        id: String(Date.now()),
        repoUrl: "https://github.com/devpilot/demo",
        owner: "devpilot",
        name: "demo",
        description:
          "This is a demo repository analysis preview generated without backend AI calls.",
        stars: 9999,
        forks: 1337,
        languages: [
          { name: "TypeScript", percentage: 80, color: "#3178c6" },
          { name: "Python", percentage: 20, color: "#3572A5" },
        ],
        techStack: ["React", "FastAPI", "Gemini", "TailwindCSS"],
        techStackDetails: [{ name: "React", description: "Frontend rendering" }],
        metadataAnalysis: { audience: "Developers", purpose: "Showcase" },
        learningComplexity: { level: "Beginner", reason: "Standard SPA architecture." },
        healthScore: 95,
        healthMetrics: {
          documentation: 90,
          codeQuality: 98,
          maintainability: 95,
          complexity: 90,
          testing: 100,
        },
        healthRecommendations: [],
        healthExplanations: {},
        overallHealth: { scoreLabel: "Excellent", summary: "Mock perfect structure." },
        metricsDetails: {},
        entryPoints: ["README.md", "src/main.tsx"],
        suggestedStartingFolders: ["src/components"],
        roadmap: [
          {
            id: "1",
            phase: "Phase 1",
            title: "Explore Demo",
            description: "View the UI.",
            estimatedTime: "5 mins",
            difficulty: "Beginner",
            items: [],
          },
        ],
        journey: { title: "Demo Journey", description: "Welcome to generic demo." },
        developerTier: { level: "All Tiers", reason: "Demonstration purpose." },
        projectContributionGuide: { summary: "N/A" },
        localSetup: { steps: [] },
        goodFirstIssues: [],
        dependencies: [],
        folderStructure: {
          name: "demo",
          type: "directory",
          children: [{ name: "src", type: "directory" }],
        },
        scannedAt: new Date().toISOString(),
      };
    }

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
      techStackDetails: rawData.summary.techStackDetails || [],
      metadataAnalysis: rawData.summary.metadataAnalysis || {},
      learningComplexity: rawData.summary.learningComplexity || {},
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
      overallHealth: rawData.health.overallHealth || {},
      metricsDetails: rawData.health.metricsDetails || {},
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
      journey: rawData.journey || {},
      developerTier: rawData.developerTier || {},
      projectContributionGuide: rawData.projectContributionGuide || {},
      localSetup: rawData.localSetup || {},
      goodFirstIssues: (rawData.goodFirstIssues || []).map((issue: any, index: number) => ({
        id: issue.id || `gfi-${index}`,
        title: issue.title,
        number: issue.number || 200 + index,
        labels: issue.labels || ["good first issue"],
        difficulty: issue.difficulty || "Easy",
        reason: issue.reason,
        relatedFiles: issue.relatedFiles || [],
        implementationGuide: issue.implementationGuide || [],
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
