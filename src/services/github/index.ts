import { FolderNode, RepositoryAnalysis } from "@/types";

export interface GitHubRepoInfo {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  languages: { name: string; percentage: number; color: string }[];
}

export interface GitHubServiceInterface {
  /**
   * Triggers the GitHub OAuth Flow to authenticate developers.
   * Extension point for Milestone 4.
   */
  initiateOAuthFlow(): Promise<boolean>;

  /**
   * Fetches the general metadata (stars, forks, description, languages) of a GitHub repository.
   */
  fetchRepositoryMetadata(repoUrl: string): Promise<GitHubRepoInfo>;

  /**
   * Fetches the recursive file directory structure of a parsed repository.
   */
  fetchFileTree(owner: string, name: string, branch?: string): Promise<FolderNode>;
}

export class GitHubService implements GitHubServiceInterface {
  async initiateOAuthFlow(): Promise<boolean> {
    console.info("GitHubService: Initiating OAuth integration flow...");
    // Future expansion point: implement popup window or redirect using oauth-integration skill
    return true;
  }

  async fetchRepositoryMetadata(repoUrl: string): Promise<GitHubRepoInfo> {
    console.info(`GitHubService: Fetching repository metadata for ${repoUrl}`);
    // Mocked response representing typical GitHub API outcomes
    const cleanUrl = repoUrl.trim().replace(/\/$/, "");
    const parts = cleanUrl.split("github.com/");
    let owner = "unknown";
    let name = "unknown-repo";
    if (parts.length > 1) {
      const subParts = parts[1].split("/");
      owner = subParts[0] || "unknown";
      name = subParts[1] || "unknown-repo";
    }

    return {
      owner,
      name,
      description: `Discovered repository ${owner}/${name}. Ready for deep abstract syntax mapping.`,
      stars: Math.floor(Math.random() * 80000) + 1500,
      forks: Math.floor(Math.random() * 8000) + 200,
      languages: [
        { name: "TypeScript", percentage: 90, color: "#3178c6" },
        { name: "JavaScript", percentage: 8, color: "#f1e05a" },
        { name: "Other", percentage: 2, color: "#858585" },
      ],
    };
  }

  async fetchFileTree(owner: string, name: string, branch = "main"): Promise<FolderNode> {
    console.info(`GitHubService: Querying tree directory for ${owner}/${name} on branch ${branch}`);
    return {
      name,
      type: "directory",
      children: [
        {
          name: "src",
          type: "directory",
          children: [
            { name: "components", type: "directory" },
            { name: "main.tsx", type: "file" },
          ],
        },
        { name: "package.json", type: "file" },
        { name: "README.md", type: "file" },
      ],
    };
  }
}

export const githubService = new GitHubService();
export default githubService;
