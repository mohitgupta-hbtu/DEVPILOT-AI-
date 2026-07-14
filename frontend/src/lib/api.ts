import type {
  Analysis,
  Favorite,
  HistoryResponse,
  MeResponse,
  SortKey,
  SortOrder,
  UserSettings,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api"; // dev: proxied by Vite to the backend

async function request<T>(path: string, options: RequestInit = {}, _retry = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (res.status === 204) return undefined as T;

  // Seamless refresh: a single 401 on a protected route triggers one silent
  // token refresh, after which the original request is retried.
  if (res.status === 401 && !_retry && !path.startsWith("/auth/")) {
    try {
      await fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
      return request<T>(path, options, true);
    } catch {
      throw new ApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail || res.statusText);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  startGithubOAuth: () => request<{ url: string }>("/auth/github", { method: "POST" }),

  logout: () => request<void>("/logout", { method: "POST" }),

  getMe: () => request<MeResponse>("/me"),

  saveAnalysis: (payload: {
    repo_url: string;
    repo_name: string;
    health_score?: number | null;
    ai_summary?: string | null;
    tech_stack?: string | null;
    learning_roadmap?: string | null;
    commit_sha?: string | null;
  }) => request<Analysis>("/analysis/save", { method: "POST", body: JSON.stringify(payload) }),

  getHistory: (params: {
    q?: string;
    sort?: SortKey;
    order?: SortOrder;
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.sort) qs.set("sort", params.sort);
    if (params.order) qs.set("order", params.order);
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    return request<HistoryResponse>(`/history?${qs.toString()}`);
  },

  getAnalysis: (id: number) => request<Analysis>(`/analysis/${id}`),

  deleteAnalysis: (id: number) => request<void>(`/analysis/${id}`, { method: "DELETE" }),

  getFavorites: (q?: string) =>
    request<Favorite[]>(`/favorites${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  addFavorite: (payload: {
    repo_url: string;
    repo_name: string;
    repo_owner?: string | null;
    note?: string | null;
  }) => request<Favorite>("/favorites", { method: "POST", body: JSON.stringify(payload) }),

  removeFavorite: (id: number) => request<void>(`/favorites/${id}`, { method: "DELETE" }),

  updateSettings: (payload: Partial<UserSettings>) =>
    request<UserSettings>("/me/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
