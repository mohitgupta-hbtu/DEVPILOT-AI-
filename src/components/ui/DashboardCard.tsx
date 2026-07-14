import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function DashboardCard({ children, className, glow = false, ...props }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/35 p-6 relative overflow-hidden backdrop-blur-sm",
        glow &&
          "after:absolute after:right-0 after:top-0 after:-mt-3 after:-mr-3 after:w-16 after:h-16 after:rounded-full after:bg-primary/5 after:blur-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  label?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, label, icon, className, ...props }: MetricCardProps) {
  return (
    <DashboardCard
      className={cn("text-left relative flex flex-col justify-between", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
          {title}
        </span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{value}</span>
        {label && (
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </DashboardCard>
  );
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function StatusBadge({
  children,
  variant = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    error: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    info: "border-primary/20 bg-primary/10 text-primary",
    default: "border-border/60 bg-muted/40 text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold font-mono",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 rounded-xl border border-dashed border-border/80 bg-card/15 min-h-[320px] max-w-xl mx-auto",
        className,
      )}
      {...props}
    >
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-md font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
