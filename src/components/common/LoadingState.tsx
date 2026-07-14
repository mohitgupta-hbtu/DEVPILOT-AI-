import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Loading...",
  className = "",
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8 text-primary",
    lg: "h-12 w-12 text-primary",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} mb-3`} />
      {message && <p className="text-xs text-muted-foreground font-medium">{message}</p>}
    </div>
  );
}

export default LoadingState;
