import React, { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function OfflineAlert() {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-card/95 p-4 shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive shrink-0">
            <WifiOff className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">You are currently offline</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              DevPilot AI is currently reading from locally persisted IndexedAst and sandbox caches.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default OfflineAlert;
