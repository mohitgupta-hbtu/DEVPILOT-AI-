import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import type { MeResponse, UserSettings } from "./types";

interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function applyTheme(settings?: UserSettings) {
  const theme = settings?.theme ?? "system";
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
      applyTheme(me.settings);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUser(null);
      else setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const login = useCallback(async () => {
    const { url } = await api.startGithubOAuth();
    window.location.href = url;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    document.documentElement.removeAttribute("data-theme");
  }, []);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const updated = await api.updateSettings(patch);
    setUser((prev) => (prev ? { ...prev, settings: updated } : prev));
    applyTheme(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, reload, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
