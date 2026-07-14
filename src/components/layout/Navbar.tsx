import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Github, Bell, Sparkles, LifeBuoy, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks";

interface NavbarProps {
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}

export function Navbar({ onOpenMobile, onOpenSearch }: NavbarProps) {
  const { user, isLoading, loginWithGitHub, logout } = useAuth();
  const { history } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Record<string, boolean>>({});
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Dynamically map real scans into timeline notifications
  const baseNotifications = history.slice(0, 4).map((scan) => ({
    id: scan.id,
    title: "Analysis Successful",
    desc: `AST mapping completed on repository '${scan.owner}/${scan.name}' with ${scan.healthScore} health score.`,
    time: new Date(scan.scannedAt).toLocaleDateString(),
    icon: Sparkles,
    unread: !readNotifIds[scan.id],
  }));

  const systemNotifications =
    history.length === 0
      ? [
          {
            id: "sys-1",
            title: "Welcome to DevPilot AI",
            desc: "Start your first codebase scan from the mapping engine.",
            time: "Just now",
            icon: LifeBuoy,
            unread: !readNotifIds["sys-1"],
          },
        ]
      : [];

  const notifications = [...baseNotifications, ...systemNotifications];

  const handleMarkAllRead = () => {
    const newlyRead = { ...readNotifIds };
    notifications.forEach((n) => {
      newlyRead[n.id] = true;
    });
    setReadNotifIds(newlyRead);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-card/25 backdrop-blur-md px-6 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="block md:hidden p-1.5 rounded-lg border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="flex h-9 w-64 items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>Search parsed repositories...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-100">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-3.5">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex h-8 items-center gap-2 rounded-md border border-border/80 bg-card/40 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all hover:border-border"
        >
          <Github className="h-3.5 w-3.5" />
          <span>DevHub</span>
        </a>

        {/* Notification trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative grid h-8 w-8 place-items-center rounded-lg border border-border/80 bg-card/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
              </>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2.5 w-80 rounded-xl border border-border bg-card shadow-xl p-4 z-50 text-left"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`flex gap-3 p-2 rounded-lg text-xs transition-colors hover:bg-muted/50 ${
                            n.unread ? "bg-primary/5 border border-primary/10" : ""
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <Icon
                              className={`h-4 w-4 ${n.unread ? "text-primary" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 text-left">
                            <span className="font-semibold text-foreground leading-tight">
                              {n.title}
                            </span>
                            <span className="text-muted-foreground leading-relaxed text-[11px]">
                              {n.desc}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile / Auth */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/40 shrink-0">
          {isLoading ? (
            <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="group relative flex items-center gap-2 cursor-pointer">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="h-7 w-7 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(var(--ring),0.1)]"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-[0_0_10px_rgba(var(--ring),0.1)]">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="hidden lg:block text-xs font-medium text-foreground">
                {user.display_name || user.username}
              </span>

              {/* Tooltip for logout on hover */}
              <button
                onClick={logout}
                className="absolute right-0 top-full mt-2 hidden group-hover:flex w-28 items-center gap-2 rounded-lg border border-border bg-card p-2 text-xs text-muted-foreground shadow-lg hover:bg-muted hover:text-foreground z-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGitHub}
              className="flex h-8 items-center gap-2 rounded-md bg-foreground px-3 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
