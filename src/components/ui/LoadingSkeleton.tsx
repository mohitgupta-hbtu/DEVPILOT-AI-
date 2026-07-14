import React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./DashboardCard";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted/30", className)} {...props} />;
}

export function OverviewLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3 text-left">
      <div className="md:col-span-2 space-y-6">
        <DashboardCard>
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="flex flex-wrap gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-lg" />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <Skeleton className="h-5 w-44 mb-4" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="space-y-6">
        <DashboardCard>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
