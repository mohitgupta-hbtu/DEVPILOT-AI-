import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsView } from "@/components/dashboard/SettingsView";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "DevPilot AI — Sandbox Settings" },
      {
        name: "description",
        content: "Modify sandbox cache TTL, Framer Motion speeds, and setup third-party keys.",
      },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <DashboardLayout>
      <SettingsView />
    </DashboardLayout>
  );
}
