import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Analysis Failed",
  description = "An unexpected error occurred during directory traversal parsing.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-destructive/20 p-10 text-center bg-destructive/5 max-w-md mx-auto ${className}`}
    >
      <div className="rounded-full bg-destructive/10 p-3 mb-4 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Retry Scan
        </button>
      )}
    </div>
  );
}

export default ErrorState;
