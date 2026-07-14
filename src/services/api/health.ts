/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "./client";
import { HealthMetrics, HealthRecommendation } from "@/types";

export interface CodeHealthReport {
  score: number;
  metrics: HealthMetrics;
  recommendations: HealthRecommendation[];
}

export const healthAPI = {
  /**
   * Fetches latest code health metrics and calculations dynamically.
   */
  async getCodeHealth(repoUrl: string): Promise<CodeHealthReport> {
    const rawData = await apiFetch<any>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ repositoryUrl: repoUrl }),
    });

    return {
      score: rawData.health.healthScore ?? 80,
      metrics: {
        documentation: rawData.health.metrics.documentation ?? 80,
        codeQuality: rawData.health.metrics.codeQuality ?? 80,
        maintainability: rawData.health.metrics.maintainability ?? 80,
        complexity: rawData.health.metrics.complexity ?? 80,
        testing: rawData.health.metrics.testing ?? 80,
      },
      recommendations: rawData.health.recommendations || [],
    };
  },
};
