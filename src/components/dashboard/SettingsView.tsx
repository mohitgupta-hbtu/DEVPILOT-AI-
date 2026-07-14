import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Key,
  Github,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useDashboard } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"general" | "keys" | "github">("general");
  const { settings, updateSettings, history } = useDashboard();
  const { user, loginWithGitHub, logout } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  // Local settings state synchronized with context on mount
  const [theme, setTheme] = useState(settings.theme);
  const [isGitHubConnected, setIsGitHubConnected] = useState(settings.isGitHubConnected);
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || "");
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || "");
  const [openrouterKey, setOpenrouterKey] = useState(settings.openrouterKey || "");
  const [githubToken, setGithubToken] = useState(settings.githubToken || "");
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState(settings.defaultWorkspaceId || "");
  const [layoutStyle, setLayoutStyle] = useState<"standard" | "compact">(
    settings.layoutStyle || "standard",
  );

  useEffect(() => {
    setTheme(settings.theme);
    setIsGitHubConnected(settings.isGitHubConnected);
    setGeminiKey(settings.geminiKey || "");
    setOpenaiKey(settings.openaiKey || "");
    setOpenrouterKey(settings.openrouterKey || "");
    setGithubToken(settings.githubToken || "");
    setDefaultWorkspaceId(settings.defaultWorkspaceId || "");
    setLayoutStyle(settings.layoutStyle || "standard");
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      theme,
      animationSpeed: 250,
      cacheLifetime: 10,
      isGitHubConnected,
      geminiKey,
      openaiKey,
      openrouterKey,
      githubToken,
      defaultWorkspaceId,
      layoutStyle,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 text-left">
            Configure parser preferences, LLM orchestration API keys, and GitHub authentications.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left side Sub-tabs */}
        <div className="space-y-1.5 md:col-span-1">
          {[
            { id: "general", label: "General Settings", icon: Sliders },
            { id: "keys", label: "AI Orchestration API Keys", icon: Key },
            { id: "github", label: "GitHub Connection", icon: Github },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "general" | "keys" | "github")}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 rounded-xl border border-border bg-card/35 p-6"
              >
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-5">
                  <Sliders className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    General Platform Preferences
                  </h3>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Interface Theme</label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dark Mode (Developer Premium)
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Light theme is disabled in this developer-first premium preview"
                      className="flex items-center justify-center rounded-lg border border-border/40 text-muted-foreground/30 text-xs font-medium cursor-not-allowed bg-muted/10"
                    >
                      Light Mode (Disabled)
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    DevPilot AI runs strictly in premium dark mode layout parameters for optimal
                    visual ergonomics.
                  </p>
                </div>

                {/* Default Launch Workspace select option */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <label className="text-xs font-bold text-foreground">
                    Default Startup Workspace
                  </label>
                  <select
                    value={defaultWorkspaceId}
                    onChange={(e) => setDefaultWorkspaceId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-xs text-foreground focus:border-primary/50 focus:outline-none transition-all max-w-sm block"
                  >
                    <option value="" className="bg-background text-foreground">
                      None (Show welcome dashboard panels)
                    </option>
                    {history.map((repo) => (
                      <option
                        key={repo.id}
                        value={repo.id}
                        className="bg-background text-foreground"
                      >
                        {repo.owner}/{repo.name} (Health: {repo.healthScore}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Determine project workspace environment that is highlighted upon launching the
                    platform page.
                  </p>
                </div>

                {/* Layout Density Style select option */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <label className="text-xs font-bold text-foreground">UI View Layout Style</label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setLayoutStyle("standard")}
                      className={`flex items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                        layoutStyle === "standard"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Standard Layout
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutStyle("compact")}
                      className={`flex items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                        layoutStyle === "compact"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Compact Coding Density
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Compact layout adjusts padding densities for maximum code visibility on
                    developer screens.
                  </p>
                </div>
              </motion.div>
            )}

            {/* AI API KEYS TAB */}
            {activeTab === "keys" && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 rounded-xl border border-border bg-card/35 p-6"
              >
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-5">
                  <Key className="h-4.5 w-4.5 text-primary shrink-0" />
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Custom Orchestration API Keys
                  </h3>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3 text-xs text-foreground/95">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-bold block text-left">Using Mock Models by default</span>
                    <span className="text-muted-foreground block leading-relaxed text-left">
                      To integrate custom production API logic, enter keys below. All calculations
                      will immediately reroute to personal endpoints securely.
                    </span>
                  </div>
                </div>

                {/* Gemini Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Google Gemini API Key (Custom Developer Key)
                    </label>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary animate-pulse">
                      Active Provider
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your Google AI Studio Gemini API Key"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3.5 text-xs text-foreground placeholder-muted-foreground/30 focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Required after 2 free scans. All scans will immediately run locally using your
                    custom key.
                  </p>
                </div>

                {/* OpenAI Key */}
                <div className="space-y-1.5 border-t border-border/40 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      OpenAI API Key (Alternative Model)
                    </label>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      Fallback
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-........................................"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3.5 text-xs text-foreground placeholder-muted-foreground/30 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* OpenRouter Key */}
                <div className="space-y-1.5 border-t border-border/40 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      OpenRouter API Key (Supports Free Models)
                    </label>
                    <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-500">
                      OpenRouter Active
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-or-v1-........................................"
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3.5 text-xs text-foreground placeholder-muted-foreground/30 focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Enables scanning using OpenRouter's free models like{" "}
                    <code>google/gemini-2.0-flash-exp:free</code>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* GITHUB TAB */}
            {activeTab === "github" && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 rounded-xl border border-border bg-card/35 p-6"
              >
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-5">
                  <Github className="h-4.5 w-4.5 text-primary shrink-0" />
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    GitHub Integration Status
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-border/60 bg-background/30 gap-4">
                  <div className="flex items-center gap-3">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="h-10 w-10 rounded-lg object-cover border border-border/40 shrink-0"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground font-bold shrink-0">
                        <Github className="h-5 w-5" />
                      </div>
                    )}
                    <div className="text-left font-sans">
                      <span className="block text-xs font-bold text-foreground">
                        {user
                          ? `${user.display_name || user.username} (${user.username})`
                          : "No Profile Connected"}
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {user
                          ? "Connected scope: read-only repository directories"
                          : "Establish secure GitHub session sync"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        logout();
                      } else {
                        loginWithGitHub();
                      }
                    }}
                    className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold border transition-all shrink-0 ${
                      user
                        ? "border-destructive/30 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
                        : "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {user ? "Disconnect GitHub" : "Connect GitHub Profile"}
                  </button>
                </div>

                {/* Personal Token option */}
                <div className="space-y-1.5 border-t border-border/40 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      GitHub Personal Access Token (Classic / Fine-Grained)
                    </label>
                    <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-500">
                      Enabled
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="github_pat_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3.5 text-xs text-foreground placeholder-muted-foreground/30 focus:border-primary focus:outline-none"
                  />
                  <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1 border border-border/40 bg-muted/10 rounded-lg p-3">
                    <p className="font-bold text-foreground">💡 How to find your GitHub token:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>
                        Go to{" "}
                        <a
                          href="https://github.com/settings/tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5"
                        >
                          GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens{" "}
                          <ExternalLink className="h-2.5 w-2.5 inline" />
                        </a>
                        .
                      </li>
                      <li>
                        Click <strong>Generate new token</strong> (Classic or Fine-Grained).
                      </li>
                      <li>
                        Select the **repo** scope (read-only access to write/read directory listings
                        is sufficient).
                      </li>
                      <li>
                        Copy the generated token (starts with <code>ghp_</code> or{" "}
                        <code>github_pat_</code>) and paste it here!
                      </li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end border-t border-border/45 pt-6">
              <div className="flex items-center gap-3 shrink-0">
                <AnimatePresence>
                  {isSaved && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1.5 text-xs text-primary font-bold"
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Preferences saved!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
