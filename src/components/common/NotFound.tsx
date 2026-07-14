import React from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center text-left">
      <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary animate-pulse">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">404</h1>
      <h2 className="text-lg font-bold tracking-tight text-muted-foreground mt-3">
        Page Not Found
      </h2>
      <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
        The workspace path you requested is either restricted or does not exist in our compiled
        bundle.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}

export default NotFound;
