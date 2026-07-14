import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: number;
  github_id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  bio?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGitHub: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGitHub: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check if the URL has an auth payload from a redirect redirection
    const hash = window.location.hash;
    if (hash.startsWith("#auth=")) {
      try {
        const encoded = hash.split("auth=")[1];
        if (encoded) {
          const decodedStr = atob(encoded);
          const decodedUser = JSON.parse(decodedStr);
          setUser(decodedUser);
          localStorage.setItem("devpilot_user", JSON.stringify(decodedUser));

          // Scrub the hash from URL to keep address bar clean
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to decode user from redirect hash:", err);
      }
    }

    // 2. Fallback to localStorage initial read
    try {
      const stored = localStorage.getItem("devpilot_user");
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      // Ignored: parsing failure on initial load
    }

    // 3. Keep in sync with /me API check
    fetch("http://localhost:8000/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("devpilot_user", JSON.stringify(data));
        } else {
          setUser(null);
          localStorage.removeItem("devpilot_user");
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithGitHub = () => {
    // Navigate the browser directly to the backend OAuth endpoint.
    // This ensures the state cookie is set on the backend domain (same-origin)
    // and the redirect chain works: Backend → GitHub → Backend callback → Frontend
    window.location.href = "http://localhost:8000/auth/github/login";
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8000/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      // Ignored: network failure during logout redirect
    }
    setUser(null);
    localStorage.removeItem("devpilot_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGitHub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
