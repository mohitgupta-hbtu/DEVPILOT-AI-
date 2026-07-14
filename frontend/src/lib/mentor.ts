import { ApiError } from "./api";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new ApiError(401, "Session expired");
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail || res.statusText);
  }
  return (await res.json()) as T;
}

export interface MentorContext {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  defaultBranch: string;
  languages: { name: string; percentage: number; color: string }[];
  techStack: string[];
  entryPoints: string[];
  suggestedStartingFolders: string[];
  dependencies: { name: string; version: string; type: string }[];
  healthScore: number | null;
  readmeSnippet: string;
  fileCount: number;
  topFolders: string[];
}

export interface MentorEvidence {
  source: string;
  detail: string;
}

export interface MentorAnswer {
  summary: string;
  explanation: string;
  evidence: MentorEvidence[];
  nextSteps: string[];
  relatedFiles: string[];
  followUpQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string; // user question or assistant fallback text
  answer?: MentorAnswer; // structured assistant answer
  pinned?: boolean;
  error?: boolean;
}

export const mentorApi = {
  loadContext: (repositoryUrl: string) =>
    request<MentorContext>("/mentor/context", { repositoryUrl }),

  ask: (repositoryUrl: string, question: string, history: { role: string; content: string }[]) =>
    request<MentorAnswer>("/mentor/chat", { repositoryUrl, question, history }),
};

export function normalizeRepoKey(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");
}

export function storageKey(repoUrl: string): string {
  return `devpilot:mentor:${normalizeRepoKey(repoUrl)}`;
}
