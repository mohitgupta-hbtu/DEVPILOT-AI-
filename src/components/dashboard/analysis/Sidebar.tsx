import React from "react";
import { History, Trash2, FolderGit2 } from "lucide-react";
import { useRepository } from "./RepositoryContext";
import { storageService } from "@/services/storage";

export function Sidebar() {
  const { history, activeResult, isScanning } = useRepository();

  const handleSelectHist = (scanId: string) => {
    if (isScanning) return;
    const item = history.find((h) => h.id === scanId);
    if (item) {
      storageService.setActiveScan(item);
      window.location.reload();
    }
  };

  const handleDeleteHist = (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    storageService.deleteScanFromHistory(scanId);
    window.location.reload();
  };

  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card/25 p-4 space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
        <History className="h-4 w-4 text-primary font-mono" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
          Scan History
        </h4>
      </div>

      <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
        {history.map((item) => {
          const isActive = activeResult?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectHist(item.id)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors cursor-pointer group ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted/40 text-muted-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate" title={`${item.owner}/${item.name}`}>
                  {item.owner}/{item.name}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteHist(e, item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0"
                aria-label={`Delete ${item.name} from history`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Sidebar;
