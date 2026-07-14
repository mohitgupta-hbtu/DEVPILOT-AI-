import { useCallback, useEffect, useState } from "react";
import { History as HistoryIcon, Search, Trash2, ArrowUpDown, ExternalLink } from "lucide-react";
import { api, ApiError } from "../lib/api";
import type { Analysis, SortKey, SortOrder } from "../lib/types";

const SORT_LABELS: Record<SortKey, string> = {
  created_at: "Saved",
  analysis_date: "Analyzed",
  repo_name: "Name",
  health_score: "Health",
};

export default function History() {
  const [items, setItems] = useState<Analysis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [healthFilter, setHealthFilter] = useState<"all" | "healthy" | "needs-work">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Analysis | null>(null);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory({
        q: q || undefined,
        sort,
        order,
        page,
        page_size: pageSize,
      });
      let filtered = res.items;
      if (healthFilter === "healthy")
        filtered = filtered.filter((a) => (a.health_score ?? 0) >= 70);
      if (healthFilter === "needs-work")
        filtered = filtered.filter((a) => (a.health_score ?? 100) < 70);
      setItems(filtered);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [q, sort, order, page, healthFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this saved analysis?")) return;
    await api.deleteAnalysis(id);
    if (open?.id === id) setOpen(null);
    void load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-6 flex items-center gap-3">
        <HistoryIcon className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Analysis history</h1>
          <p className="text-sm text-ink-soft">{total} saved analyses</p>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search repositories…"
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </div>

        <select
          value={healthFilter}
          onChange={(e) => {
            setPage(1);
            setHealthFilter(e.target.value as typeof healthFilter);
          }}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="all">All health</option>
          <option value="healthy">Healthy (≥70)</option>
          <option value="needs-work">Needs work (&lt;70)</option>
        </select>

        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowUpDown className="h-4 w-4" />
          {SORT_LABELS[sort]} {order === "asc" ? "↑" : "↓"}
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              Sort: {SORT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {loading ? (
          <p className="p-6 text-sm text-ink-faint">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-ink-faint">No analyses match your filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3 font-medium">Repository</th>
                <th className="px-5 py-3 font-medium">Health</th>
                <th className="px-5 py-3 font-medium">Saved</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {items.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <button onClick={() => setOpen(a)} className="text-left">
                      <p className="font-medium text-ink">{a.repo_name}</p>
                      <p className="text-xs text-ink-faint">{a.repo_url}</p>
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    {a.health_score != null ? (
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${a.health_score >= 70 ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                      >
                        {a.health_score}
                      </span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setOpen(a)}
                      title="Open"
                      className="rounded-md p-1.5 text-ink-soft hover:bg-elevated hover:text-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      title="Delete"
                      className="rounded-md p-1.5 text-ink-soft hover:bg-elevated hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {open && <AnalysisDrawer analysis={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function AnalysisDrawer({ analysis, onClose }: { analysis: Analysis; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto border-l border-line bg-surface p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{analysis.repo_name}</h2>
            <a
              href={analysis.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              {analysis.repo_url}
            </a>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-ink-soft hover:bg-elevated">
            ✕
          </button>
        </div>

        {analysis.health_score != null && (
          <Stat label="Health score" value={String(analysis.health_score)} />
        )}
        {analysis.commit_sha && (
          <Stat label="Commit SHA" value={analysis.commit_sha.slice(0, 12)} mono />
        )}
        {analysis.ai_summary && <Block label="AI summary" body={analysis.ai_summary} />}
        {analysis.tech_stack && <Block label="Tech stack" body={analysis.tech_stack} />}
        {analysis.learning_roadmap && (
          <Block label="Learning roadmap" body={analysis.learning_roadmap} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={`text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <div className="whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 text-sm text-ink-soft">
        {body}
      </div>
    </div>
  );
}
