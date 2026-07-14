import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Flame,
  Search,
  ArrowRight,
  Clock,
  Trash2,
  ChevronRight,
  Code,
} from "lucide-react";
import { useDashboard } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { RepositoryAnalysis } from "@/types";

export function DashboardView() {
  const navigate = useNavigate();
  const { history, deleteScan, loadScan, settings } = useDashboard();
  const { user } = useAuth();
  const [fastUrl, setFastUrl] = useState("");

  const handleFastScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastUrl.trim()) return;
    navigate({ to: "/analyze", search: { url: fastUrl.trim() } });
  };

  const handleLoadRepo = (repo: RepositoryAnalysis) => {
    loadScan(repo);
    navigate({ to: "/analyze", search: { activeId: repo.id } });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScan(id);
  };

  // Compute mock stats
  const totalScans = history.length;
  const avgHealth =
    totalScans > 0
      ? Math.round(history.reduce((acc, r) => acc + r.healthScore, 0) / totalScans)
      : 0;
  const totalStarsSaved = history.reduce((acc, r) => acc + r.stars, 0);

  const defaultWorkspace = settings.defaultWorkspaceId
    ? history.find((repo) => repo.id === settings.defaultWorkspaceId)
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user ? user.display_name || user.username : "Developer"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-left">
            Analyze, visualize, and roadmap any repository instantaneously. Ready for your next deep
            dive?
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Repository Scan</span>
        </Link>
      </div>

      {/* Default Active Workspace Card Widget */}
      {defaultWorkspace && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/25 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left shadow-[var(--shadow-glow)] shadow-primary/5"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                Primary Active Workspace
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground font-mono">
              {defaultWorkspace.owner}/{defaultWorkspace.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {defaultWorkspace.description || "Active mapping repository spec context workspace."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block font-mono">
              <div className="text-xs font-semibold text-foreground">
                Health Score: {defaultWorkspace.healthScore}%
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                Scanned {new Date(defaultWorkspace.scannedAt).toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={() => handleLoadRepo(defaultWorkspace)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Scanned */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/45 p-5 shadow-sm hover:border-primary/30 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scanned Repos
            </span>
            <span className="rounded-lg bg-primary/10 p-2 text-primary font-bold">
              <Code className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">{totalScans}</span>
            <span className="text-xs text-primary font-medium">Scans persisted</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Cached locally in secure sandbox storage
          </p>
        </motion.div>

        {/* Avg Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-border/60 bg-card/45 p-5 shadow-sm hover:border-primary/30 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Health
            </span>
            <span className="rounded-lg bg-primary/10 p-2 text-primary font-bold">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-primary">{avgHealth}%</span>
            <span className="text-xs text-muted-foreground">Overall compliance</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on documentation, testing, complexity metrics
          </p>
        </motion.div>

        {/* Total Stars Saved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/45 p-5 shadow-sm hover:border-primary/30 transition-all duration-300 sm:col-span-2 lg:col-span-1 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aggregate Popularity
            </span>
            <span className="rounded-lg bg-primary/10 p-2 text-primary font-bold">
              <Flame className="h-4 w-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {totalStarsSaved.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">Combined Stars</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sum of parsed open source GitHub repos
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 columns: Fast scanning + Recent history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Scan Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-xl border border-primary/20 bg-card/30 p-5 backdrop-blur-sm text-left"
          >
            <h3 className="text-sm font-semibold text-foreground mb-1">Fast-Track Scan</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Skip menus and instantly feed a GitHub repository URL into the parsing engine.
            </p>
            <form onSubmit={handleFastScanSubmit} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={fastUrl}
                  onChange={(e) => setFastUrl(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-background/50 pl-10 pr-4 text-xs text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <span>Go</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>

          {/* Recent Scans Table / List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold tracking-tight">Recent Scans</h2>
              <Link
                to="/history"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All History</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Code className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold">No Scans Found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  You haven&apos;t analyzed any repositories yet. Input a repository link on our
                  analyze page.
                </p>
                <Link
                  to="/analyze"
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Analyze Your First Repo</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {history.slice(0, 4).map((repo, idx) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    onClick={() => handleLoadRepo(repo)}
                    className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm hover:border-primary/40 hover:bg-card/75 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 text-primary shrink-0">
                        <GitBranch className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                            {repo.owner}/
                          </span>
                          <span className="text-xs font-semibold font-mono text-foreground group-hover:text-primary transition-colors">
                            {repo.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(repo.scannedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            ★{" "}
                            {repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Health Indicator Badge */}
                      <div className="text-right">
                        <div className="text-xs font-semibold text-primary">
                          {repo.healthScore}/100
                        </div>
                        <div className="text-[9px] text-muted-foreground">Health Score</div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(repo.id, e)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete Scanned Repo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Platform guidelines and facts */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card/35 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-left">
              Developer Insights
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary/10 text-xs font-semibold text-primary font-mono">
                  01
                </span>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-foreground">
                    Multi-Language Discovery
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Parser examines project files recursively, mapping core architectures,
                    frameworks, entrypoints, and dependencies.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-border/45 pt-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary/10 text-xs font-semibold text-primary font-mono">
                  02
                </span>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-foreground">
                    Interactive Roadmap Builders
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Turns dense repository structures into accessible steps, helping teams and
                    individuals onboard to any code in minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-border/45 pt-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary/10 text-xs font-semibold text-primary font-mono">
                  03
                </span>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-foreground">
                    Health & Compliance Check
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Gauges code health based on test availability, structure modularity, file
                    complexity, and inline documentation patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Helper card */}
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-5 text-left">
            <h3 className="text-xs font-semibold text-primary mb-1">Sandbox Environment active</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              This preview dashboard runs entirely client-side. Data remains safely isolated in your
              local cache, with easy extension points for server hookups.
            </p>
            <Link
              to="/settings"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-colors font-semibold"
            >
              Configure API Keys
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
