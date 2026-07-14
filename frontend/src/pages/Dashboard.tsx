import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, History as HistoryIcon, Sparkles, Star, ArrowUpRight, Plus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import type { Analysis, Favorite } from "../lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recent, setRecent] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFavorites(), api.getHistory({ page: 1, page_size: 5 })])
      .then(([favs, hist]) => {
        setFavorites(favs);
        setRecent(hist.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.display_name?.split(" ")[0] ?? user?.username ?? "there";

  const quickActions = [
    { label: "Analyze a repository", icon: Sparkles, onClick: () => navigate("/dashboard") },
    { label: "View history", icon: HistoryIcon, onClick: () => navigate("/history") },
    { label: "Manage favorites", icon: Star, onClick: () => navigate("/favorites") },
    { label: "Workspace settings", icon: Github, onClick: () => navigate("/settings") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-10 flex items-center gap-4">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-full border border-line" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-elevated" />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-ink-soft">
            @{user?.username} · {user?.tier}
          </p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-faint">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="flex-1 text-sm font-medium text-ink">{label}</span>
              <ArrowUpRight className="h-4 w-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Recent analyses"
          icon={HistoryIcon}
          onMore={() => navigate("/history")}
          loading={loading}
        >
          {recent.length === 0 ? (
            <Empty text="No analyses saved yet." />
          ) : (
            recent.map((a) => (
              <Row
                key={a.id}
                title={a.repo_name}
                meta={a.repo_url}
                badge={a.health_score != null ? `${a.health_score}` : null}
                onClick={() => navigate("/history")}
              />
            ))
          )}
        </Panel>

        <Panel
          title="Favorite repositories"
          icon={Star}
          onMore={() => navigate("/favorites")}
          loading={loading}
        >
          {favorites.length === 0 ? (
            <Empty text="No favorites yet." />
          ) : (
            favorites
              .slice(0, 5)
              .map((f) => (
                <Row
                  key={f.id}
                  title={f.repo_name}
                  meta={f.repo_url}
                  onClick={() => navigate("/favorites")}
                />
              ))
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  onMore,
  loading,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onMore: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
          <Icon className="h-4 w-4 text-ink-soft" />
          {title}
        </h3>
        <button onClick={onMore} className="text-xs text-ink-soft hover:text-accent">
          View all
        </button>
      </div>
      <div className="divide-y divide-line-soft px-5">
        {loading ? <div className="py-6 text-sm text-ink-faint">Loading…</div> : children}
      </div>
    </section>
  );
}

function Row({
  title,
  meta,
  badge,
  onClick,
}: {
  title: string;
  meta: string;
  badge?: string | null;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className="truncate text-xs text-ink-faint">{meta}</p>
      </div>
      {badge != null && (
        <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
          {badge}
        </span>
      )}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Plus className="h-5 w-5 text-ink-faint" />
      <p className="text-sm text-ink-faint">{text}</p>
    </div>
  );
}
