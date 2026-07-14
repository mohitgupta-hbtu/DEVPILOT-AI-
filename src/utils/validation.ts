import { z } from "zod";

export const gitHubUrlSchema = z
  .string()
  .min(1, "GitHub URL is required")
  .refine((url) => {
    try {
      const parsed = new URL(url.trim());
      return parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
    } catch {
      return false;
    }
  }, "Must be a valid GitHub URL (e.g. github.com/owner/repository)")
  .refine((url) => {
    const cleanUrl = url.trim().replace(/\/$/, "");
    const parts = cleanUrl.split("github.com/")[1];
    if (!parts) return false;
    const pathParts = parts.split("/");
    return pathParts.length >= 2 && pathParts[0].length > 0 && pathParts[1].length > 0;
  }, "GitHub URL must include both owner and repository name");

export const analysisRequestSchema = z.object({
  repositoryUrl: gitHubUrlSchema,
  branch: z.string().min(1, "Branch name is required"),
  depth: z.enum(["deep", "shallow", "files"]),
});
