import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevPilot AI — Understand Any GitHub Repository in Minutes" },
      {
        name: "description",
        content:
          "DevPilot AI reads any GitHub repository and gives you an instant summary, architecture map, learning roadmap and health check.",
      },
    ],
  }),
  component: Landing,
});
