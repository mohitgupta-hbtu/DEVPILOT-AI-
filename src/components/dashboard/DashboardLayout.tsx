import React, { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Sparkles, History, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useDashboard } from "@/hooks";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { history, settings } = useDashboard();

  // Listen to Command+K or Control+K to trigger the Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearchModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center border-b border-border px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  placeholder="Search scanned repositories or files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="rounded px-1.5 py-0.5 text-xs border border-border text-muted-foreground hover:text-foreground"
                >
                  ESC
                </button>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                {searchQuery ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground text-left">Results</p>
                    <Link
                      to="/analyze"
                      onClick={() => setShowSearchModal(false)}
                      className="flex items-center justify-between rounded-lg p-2.5 hover:bg-muted text-sm transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Analyze new repository with URL &quot;{searchQuery}&quot;</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 text-left">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/analyze"
                          onClick={() => setShowSearchModal(false)}
                          className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-muted text-xs transition-colors"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span>New Analysis</span>
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setShowSearchModal(false)}
                          className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-muted text-xs transition-colors"
                        >
                          <History className="h-4 w-4 text-primary" />
                          <span>View History</span>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 text-left">
                        Scanned Recently
                      </p>
                      <div className="space-y-1">
                        {history.slice(0, 3).map((item) => (
                          <Link
                            key={item.id}
                            to="/analyze"
                            search={{ activeId: item.id }}
                            onClick={() => setShowSearchModal(false)}
                            className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted text-xs transition-colors text-left"
                          >
                            <span className="font-mono text-muted-foreground">
                              {item.owner}/{item.name}
                            </span>
                            <span className="text-primary font-medium">{item.healthScore}/100</span>
                          </Link>
                        ))}
                        {history.length === 0 && (
                          <p className="text-[11px] text-muted-foreground text-left italic">
                            No recent scans
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur-md">
        <Sidebar />
      </aside>

      {/* Mobile Menu Backdrop & Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card border-r border-border md:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-border/40 shrink-0">
                <span className="flex items-center gap-2.5 font-semibold tracking-tight">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                    <span className="text-sm font-bold">D</span>
                  </span>
                  <span className="text-sm font-bold">DevPilot AI</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar onCloseMobile={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setShowSearchModal(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-background/35 bg-grid relative scrollbar-thin">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-hero pointer-events-none opacity-40" />
          <div
            className={`mx-auto relative z-10 h-full transition-all ${
              settings.layoutStyle === "compact"
                ? "p-4 md:p-5 max-w-[1700px]"
                : "p-6 md:p-8 max-w-[1400px]"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
