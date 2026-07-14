import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search,
  Trash2,
  ChevronRight,
  GitBranch,
  History,
  Sparkles,
  Clock,
  Filter,
} from "lucide-react";
import { useDashboard } from "@/hooks";
import { RepositoryAnalysis } from "@/types";

export function HistoryView() {
  const navigate = useNavigate();
  const { history, deleteScan, loadScan } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [minHealth, setMinHealth] = useState(0);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScan(id);
  };

  const handleOpenScan = (scan: RepositoryAnalysis) => {
    loadScan(scan);
    navigate({ to: "/analyze", search: { activeId: scan.id } });
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.repoUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = item.healthScore >= minHealth;
    return matchesSearch && matchesHealth;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Scan History</h1>
          <p className="text-sm text-muted-foreground mt-1 text-left">
            Access, view, and load previous workspace maps and learning timelines.
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] shrink-0 font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-16 text-center bg-card/10 max-w-lg mx-auto">
          <div className="rounded-full bg-muted p-3 mb-4 text-muted-foreground">
            <History className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Scan History</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Your local persistence workspace is currently empty. Run an analysis on the mapping page
            first!
          </p>
          <Link
            to="/analyze"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium hover:bg-muted font-semibold transition-colors text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Map Your First Repo</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between rounded-xl border border-border/50 bg-card/20 p-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-border/60 bg-background/50 pl-10 pr-4 text-xs text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Min Health Score:</span>
                <select
                  value={minHealth}
                  onChange={(e) => setMinHealth(Number(e.target.value))}
                  className="h-9 rounded-lg border border-border/60 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 font-medium"
                >
                  <option value={0} className="bg-background text-foreground">
                    All Scores
                  </option>
                  <option value={80} className="bg-background text-foreground">
                    &gt;= 80
                  </option>
                  <option value={90} className="bg-background text-foreground">
                    &gt;= 90
                  </option>
                  <option value={95} className="bg-background text-foreground">
                    &gt;= 95
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Scans Grid Table list */}
          <div className="rounded-xl border border-border/60 bg-card/15 overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground italic">
                No scans match your active filtering parameters.
              </div>
            ) : (
              <div className="overflow-x-auto text-left">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-card/30 text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-5 text-left">Repository</th>
                      <th className="py-3 px-5 text-left">Scanned Date</th>
                      <th className="py-3 px-5 text-left">Stars</th>
                      <th className="py-3 px-5 text-left">Health Score</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.04 }}
                        onClick={() => handleOpenScan(item)}
                        className="border-b border-border/40 hover:bg-muted/10 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 border border-primary/10 text-primary shrink-0 font-bold">
                              <GitBranch className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold font-mono">
                                <span className="text-muted-foreground">{item.owner}/</span>
                                <span className="text-foreground group-hover:text-primary transition-colors">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono leading-none block mt-0.5 truncate max-w-[220px]">
                                {item.repoUrl}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-mono text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(item.scannedAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-4 px-5 font-mono text-muted-foreground font-bold">
                          ★ {item.stars >= 1000 ? `${(item.stars / 1000).toFixed(1)}k` : item.stars}
                        </td>

                        <td className="py-4 px-5 font-bold text-primary font-mono text-sm">
                          {item.healthScore}/100
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors shrink-0"
                              title="Delete Scan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryView;
