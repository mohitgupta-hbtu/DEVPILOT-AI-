export interface UserPublic {
  id: number;
  github_id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  created_at: string;
  last_login: string;
  tier: string;
}

export interface UserSettings {
  user_id: number;
  theme: "system" | "light" | "dark";
  ai_provider: string;
  language: string;
  email_notifications: boolean;
  product_updates: boolean;
  public_profile: boolean;
  updated_at: string;
}

export interface MeResponse extends UserPublic {
  settings: UserSettings;
}

export interface Analysis {
  id: number;
  user_id: number;
  repo_url: string;
  repo_name: string;
  analysis_date: string;
  health_score: number | null;
  ai_summary: string | null;
  tech_stack: string | null;
  learning_roadmap: string | null;
  commit_sha: string | null;
  created_at: string;
}

export interface HistoryResponse {
  items: Analysis[];
  total: number;
  page: number;
  page_size: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  repo_url: string;
  repo_name: string;
  repo_owner: string | null;
  note: string | null;
  created_at: string;
}

export type SortKey = "created_at" | "analysis_date" | "repo_name" | "health_score";
export type SortOrder = "asc" | "desc";
