import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  BookOpen,
  FileText,
  LifeBuoy,
  ExternalLink,
  User,
  LogOut,
  Github,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export const MENU_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Map & Learn", icon: Sparkles, href: "/analyze" },
  { label: "Scan History", icon: History, href: "/history" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export const SECONDARY_ITEMS = [
  {
    label: "Documentation",
    icon: BookOpen,
    href: "https://github.com/mohitgupta-hbtu/DEVPILOT-AI-/blob/main/README.md",
  },
  { label: "API Reference", icon: FileText, href: "http://localhost:8000/docs" },
  {
    label: "Support",
    icon: LifeBuoy,
    href: "https://github.com/mohitgupta-hbtu/DEVPILOT-AI-/issues",
  },
];

export function Sidebar({ onCloseMobile, className = "" }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout, loginWithGitHub } = useAuth();

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border/40 shrink-0">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="text-sm font-bold">D</span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold leading-none">DevPilot AI</span>
            <span className="text-[10px] text-primary mt-0.5 font-mono">v1.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-left">
          Workspace
        </div>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-left">
          Resources
        </div>
        {SECONDARY_ITEMS.map((item) => {
          const Icon = item.icon;
          const href =
            item.label === "API Reference"
              ? `${(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "")}/docs`
              : item.href;
          return (
            <a
              key={item.label}
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={handleLinkClick}
              className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground/55" />
            </a>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-border/40 bg-background/20 shrink-0">
        {user ? (
          <div className="flex items-center justify-between rounded-lg bg-card/60 border border-border/50 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-muted">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.username}
                    className="h-full w-full object-cover animate-fade-in"
                  />
                ) : (
                  <User className="h-full w-full p-1.5 text-muted-foreground" />
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-card bg-emerald-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-none text-foreground truncate max-w-[100px]">
                  {user.display_name || user.username}
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-none font-mono truncate max-w-[100px]">
                  @{user.username}
                </span>
              </div>
            </div>
            <button
              title="Sign Out"
              onClick={() => logout()}
              className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithGitHub()}
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-primary py-2 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all font-sans"
          >
            <Github className="h-4 w-4" />
            <span>Connect GitHub</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
