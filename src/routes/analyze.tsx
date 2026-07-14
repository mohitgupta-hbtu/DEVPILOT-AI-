import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AnalyzeView } from "@/components/dashboard/AnalyzeView";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "DevPilot AI — Analyze Repository" },
      {
        name: "description",
        content:
          "Trace architecture models, explore dependency trees, and navigate interactive learning timelines.",
      },
    ],
  }),
  component: AnalyzeRoute,
});

function AnalyzeRoute() {
  return (
    <DashboardLayout>
      <AnalyzeView />
    </DashboardLayout>
  );
}
