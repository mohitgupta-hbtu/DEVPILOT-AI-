import { useCallback, useEffect, useState } from "react";
import { Star, Trash2, ExternalLink, Plus, Github } from "lucide-react";
import { api, ApiError } from "../lib/api";
import type { Favorite } from "../lib/types";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ repo_url: "", repo_name: "", repo_owner: "" });
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFavorites(await api.getFavorites());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.repo_url || !form.repo_name) {
      setError("Repository URL and name are required.");
      return;
    }
    setAdding(true);
    try {
      await api.addFavorite({
        repo_url: form.repo_url,
        repo_name: form.repo_name,
        repo_owner: form.repo_owner || null,
      });
      setForm({ repo_url: "", repo_name: "", repo_owner: "" });
      void load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add favorite");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: number) {
    await api.removeFavorite(id);
    void load();
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <header className="mb-6 flex items-center gap-3">
        <Star className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Favorites</h1>
          <p className="text-sm text-ink-soft">Pin repositories for quick access</p>
        </div>
      </header>

      <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-line bg-surface p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={form.repo_url}
            onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
            placeholder="https://github.com/owner/repo"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
          <input
            value={form.repo_name}
            onChange={(e) => setForm({ ...form, repo_name: e.target.value })}
            placeholder="repo-name"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
          <input
            value={form.repo_owner}
            onChange={(e) => setForm({ ...form, repo_owner: e.target.value })}
            placeholder="owner (optional)"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={adding}
          className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {adding ? "Adding…" : "Add favorite"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-12 text-center">
          <Star className="h-6 w-6 text-ink-faint" />
          <p className="text-sm text-ink-faint">No favorites yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {favorites.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <Github className="h-5 w-5 shrink-0 text-ink-soft" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {f.repo_owner ? `${f.repo_owner}/` : ""}
                  {f.repo_name}
                </p>
                <a
                  href={f.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 truncate text-xs text-ink-faint hover:text-accent"
                >
                  {f.repo_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <button
                onClick={() => handleRemove(f.id)}
                title="Remove"
                className="rounded-md p-2 text-ink-soft transition-colors hover:bg-elevated hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
