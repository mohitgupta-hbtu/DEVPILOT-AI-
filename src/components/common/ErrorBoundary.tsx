import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled crash:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
            A rendering crash occurred in the visual layer. Ensure your custom settings or ast
            structures match our workspace schemas.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-lg rounded-lg border border-border/80 bg-background/50 p-4 font-mono text-[10px] text-destructive overflow-auto text-left max-h-40 w-full">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
