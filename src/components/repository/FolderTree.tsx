import React, { useState } from "react";
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import { FolderNode } from "@/types";

interface FolderTreeProps {
  node: FolderNode;
  depth?: number;
  parentPath?: string;
  selectedFile?: string;
  onSelectFile?: (path: string) => void;
}

export function FolderTree({
  node,
  depth = 0,
  parentPath = "",
  selectedFile,
  onSelectFile,
}: FolderTreeProps) {
  const [expanded, setExpanded] = useState(true);

  const isDir = node.type === "directory";
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isSelected = selectedFile === currentPath;

  const handleToggle = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else if (onSelectFile) {
      onSelectFile(currentPath);
    }
  };

  return (
    <div className="select-none text-left font-mono">
      <div
        onClick={handleToggle}
        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-md text-xs transition-colors cursor-pointer ${
          isDir
            ? "hover:bg-muted/40"
            : isSelected
              ? "bg-primary/15 text-primary border-l border-primary"
              : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Folder className="h-4 w-4 text-primary fill-primary/10" />
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
          </>
        )}
        <span className={`text-[11px] font-mono ${isSelected ? "font-semibold text-primary" : ""}`}>
          {node.name}
        </span>
      </div>

      {isDir && expanded && node.children && (
        <div className="space-y-0.5">
          {node.children.map((child, index) => (
            <FolderTree
              key={index}
              node={child}
              depth={depth + 1}
              parentPath={currentPath}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FolderTree;
