import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "DevPilot AI — Master Dashboard" },
      {
        name: "description",
        content:
          "Access your repository analysis statistics, scanned files, and dynamic learning roadmap insights.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}
