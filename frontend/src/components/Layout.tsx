import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Star,
  Settings as SettingsIcon,
  LogOut,
  Boxes,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/favorites", label: "Favorites", icon: Star },
  { to: "/mentor", label: "Mentor", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <aside className="flex w-64 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-2 px-5 py-5 text-ink">
          <Boxes className="h-6 w-6 text-accent" />
          <span className="text-base font-semibold tracking-tight">DevPilot AI</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-soft text-ink"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full border border-line"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-elevated" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {user?.display_name ?? user?.username}
              </p>
              <p className="truncate text-xs text-ink-faint">@{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-md p-2 text-ink-faint transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-x-hidden" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
