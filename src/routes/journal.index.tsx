import { createFileRoute } from "@tanstack/react-router";
import { JournalComingSoon } from "@/routes/journal.coming-soon";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Keep the Vibes Going · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JournalComingSoon,
});
