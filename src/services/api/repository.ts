/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "./client";

export interface RepoDetails {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  license?: string;
  defaultBranch: string;
}

export const repositoryAPI = {
  /**
   * Fetches metadata for a repository.
   * Leverages the FastAPI backend to proxy or parse.
   */
  async getDetails(repoUrl: string): Promise<RepoDetails> {
    const rawData = await apiFetch<any>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ repositoryUrl: repoUrl }),
    });

    return {
      owner: rawData.repository.owner,
      name: rawData.repository.name,
      description: rawData.repository.description || "",
      stars: rawData.repository.stars ?? 0,
      forks: rawData.repository.forks ?? 0,
      license: rawData.repository.license,
      defaultBranch: rawData.repository.defaultBranch || "main",
    };
  },
};
