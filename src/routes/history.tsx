import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HistoryView } from "@/components/dashboard/HistoryView";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "DevPilot AI — Scan History" },
      {
        name: "description",
        content: "View all previously parsed and locally cached open source codebase profiles.",
      },
    ],
  }),
  component: HistoryRoute,
});

function HistoryRoute() {
  return (
    <DashboardLayout>
      <HistoryView />
    </DashboardLayout>
  );
}
